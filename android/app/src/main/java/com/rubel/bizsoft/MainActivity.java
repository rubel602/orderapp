package com.rubel.bizsoft;

import android.Manifest;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.provider.Settings;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.os.Message;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;

import java.io.OutputStream;

/**
 * Loads the bundled index.html (assets/index.html) inside a WebView.
 * The page is served from https://appassets.androidplatform.net so that
 * localStorage / IndexedDB / fetch behave like a normal secure website.
 */
public class MainActivity extends Activity {

    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/assets/index.html";
    private static final int REQ_FILE = 11;
    private static final int REQ_LOC = 12;

    private WebView web;
    private ValueCallback<Uri[]> fileCb;
    private GeolocationPermissions.Callback geoCb;
    private String geoOrigin;

    private static final String DL_HOOK =
        "(function(){if(window.__bsHook)return;window.__bsHook=1;" +
        "document.addEventListener('click',function(ev){var a=ev.target&&ev.target.closest?ev.target.closest('a[download]'):null;" +
        "if(!a||!a.href||a.href.indexOf('blob:')!==0)return;ev.preventDefault();ev.stopPropagation();" +
        "fetch(a.href).then(function(r){return r.blob()}).then(function(b){var f=new FileReader();" +
        "f.onloadend=function(){AndroidBridge.save(String(f.result),a.download||'file',b.type||'application/octet-stream')};f.readAsDataURL(b)})},true);" +
        "var o=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){" +
        "if(this.download&&this.href&&this.href.indexOf('blob:')===0){var a=this;fetch(a.href).then(function(r){return r.blob()}).then(function(b){var f=new FileReader();" +
        "f.onloadend=function(){AndroidBridge.save(String(f.result),a.download||'file',b.type||'application/octet-stream')};f.readAsDataURL(b)});return}" +
        "return o.apply(this,arguments)}})();";

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().setStatusBarColor(0xFF1E40AF);

        web = new WebView(this);
        web.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(web);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .setDomain(HOST)
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
            .build();

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportMultipleWindows(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setBuiltInZoomControls(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        web.addJavascriptInterface(new Bridge(), "AndroidBridge");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                return loader.shouldInterceptRequest(r.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (HOST.equals(u.getHost())) return false;
                openExternal(u);
                return true;
            }

            @Override
            public void onPageStarted(WebView v, String url, Bitmap f) {
                v.evaluateJavascript(DL_HOOK, null);
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                v.evaluateJavascript(DL_HOOK, null);
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView v, boolean dialog, boolean gesture, Message msg) {
                // window.open(...) (WhatsApp, maps, ...) -> open in the matching external app
                WebView tmp = new WebView(MainActivity.this);
                tmp.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView x, WebResourceRequest r) {
                        openExternal(r.getUrl());
                        x.destroy();
                        return true;
                    }

                    @Override
                    public void onPageStarted(WebView x, String url, Bitmap f) {
                        if (url != null && !url.startsWith("about:")) openExternal(Uri.parse(url));
                        x.stopLoading();
                        x.destroy();
                    }
                });
                ((WebView.WebViewTransport) msg.obj).setWebView(tmp);
                msg.sendToTarget();
                return true;
            }

            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                try {
                    startActivityForResult(p.createIntent(), REQ_FILE);
                } catch (Exception e) {
                    fileCb = null;
                    return false;
                }
                return true;
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback cb) {
                if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    cb.invoke(origin, true, false);
                } else {
                    geoCb = cb;
                    geoOrigin = origin;
                    requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, REQ_LOC);
                }
            }
        });

        if (b == null) web.loadUrl(START_URL);
        else web.restoreState(b);

        // automatic update check (at most once every 6 hours)
        SharedPreferences sp = getSharedPreferences("upd", MODE_PRIVATE);
        long now = System.currentTimeMillis();
        if (now - sp.getLong("last", 0) > 6L * 3600 * 1000) {
            sp.edit().putLong("last", now).apply();
            checkUpdate(false);
        }
    }

    private void openExternal(Uri u) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, u);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception e) {
            Toast.makeText(this, "No app found to open this link", Toast.LENGTH_SHORT).show();
        }
    }


    // ---------------------------------------------------------------- auto update
    /** Looks at the latest GitHub release of this repository and offers the new APK. */
    private static String relUrl(String file) {
        return "https://github.com/" + BuildConfig.GITHUB_REPO + "/releases/download/android-latest/" + file;
    }

    /** Reads version.txt of the "android-latest" GitHub release and offers the new APK. */
    private void checkUpdate(final boolean manual) {
        if (BuildConfig.GITHUB_REPO.isEmpty()) {
            if (manual) toast("Update source is not set. Build the app with GitHub Actions.");
            return;
        }
        new Thread(() -> {
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(relUrl("version.txt")).openConnection();
                c.setConnectTimeout(8000);
                c.setReadTimeout(8000);
                if (c.getResponseCode() != 200) throw new Exception("HTTP " + c.getResponseCode());
                String line;
                try (BufferedReader r = new BufferedReader(new InputStreamReader(c.getInputStream()))) {
                    line = r.readLine();
                }
                final int v = Integer.parseInt(line.trim());
                if (v > BuildConfig.VERSION_CODE) {
                    runOnUiThread(() -> askUpdate("1." + v, relUrl("BusinessSoftwareERP.apk")));
                } else if (manual) {
                    runOnUiThread(() -> toast("You have the latest version (" + BuildConfig.VERSION_NAME + ")"));
                }
            } catch (Exception e) {
                if (manual) runOnUiThread(() -> toast("Could not check for updates. Is the repository public and online?"));
            }
        }).start();
    }

    private void askUpdate(String tag, final String apkUrl) {
        if (isFinishing()) return;
        new AlertDialog.Builder(this)
            .setTitle("New version available")
            .setMessage("A new version (" + tag + ") of Business Software ERP is ready. Your data stays on this phone.")
            .setPositiveButton("Update now", (d, w) -> downloadUpdate(apkUrl))
            .setNegativeButton("Later", null)
            .show();
    }

    private void downloadUpdate(String apkUrl) {
        if (!getPackageManager().canRequestPackageInstalls()) {
            toast("Allow \"Install unknown apps\" for this app, then tap Update again");
            startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getPackageName())));
            return;
        }
        try {
            final File f = new File(getExternalFilesDir(null), "update.apk");
            if (f.exists()) f.delete();
            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            DownloadManager.Request r = new DownloadManager.Request(Uri.parse(apkUrl));
            r.setTitle("Business Software ERP update");
            r.setMimeType("application/vnd.android.package-archive");
            r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            r.setDestinationUri(Uri.fromFile(f));
            final long id = dm.enqueue(r);
            toast("Downloading update…");
            BroadcastReceiver rc = new BroadcastReceiver() {
                @Override
                public void onReceive(Context c, Intent i) {
                    if (i.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1) != id) return;
                    try {
                        unregisterReceiver(this);
                    } catch (Exception ignore) {
                    }
                    installApk(f);
                }
            };
            ContextCompat.registerReceiver(this, rc, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), ContextCompat.RECEIVER_EXPORTED);
        } catch (Exception e) {
            toast("Update download failed");
        }
    }

    private void installApk(File f) {
        try {
            Uri u = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", f);
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(u, "application/vnd.android.package-archive");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception e) {
            toast("Could not start the installer");
        }
    }

    private void toast(String m) {
        Toast.makeText(this, m, Toast.LENGTH_LONG).show();
    }

    /** Called from JavaScript to save generated files (backup, Excel, PDF...) into Downloads. */
    public class Bridge {
        @JavascriptInterface
        public String version() {
            return BuildConfig.VERSION_NAME;
        }

        @JavascriptInterface
        public void checkUpdate() {
            MainActivity.this.checkUpdate(true);
        }

        @JavascriptInterface
        public void save(final String dataUrl, final String name, final String mime) {
            runOnUiThread(() -> {
                try {
                    int c = dataUrl.indexOf(',');
                    byte[] bytes = Base64.decode(dataUrl.substring(c + 1), Base64.DEFAULT);
                    String safe = name.replaceAll("[\\\\/:*?\"<>|]", "_");
                    ContentValues cv = new ContentValues();
                    cv.put(MediaStore.Downloads.DISPLAY_NAME, safe);
                    cv.put(MediaStore.Downloads.MIME_TYPE, mime);
                    cv.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                    Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                    if (u == null) throw new Exception("no uri");
                    try (OutputStream o = getContentResolver().openOutputStream(u)) {
                        o.write(bytes);
                    }
                    Toast.makeText(MainActivity.this, "Saved to Downloads: " + safe, Toast.LENGTH_LONG).show();
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Could not save the file", Toast.LENGTH_LONG).show();
                }
            });
        }
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_FILE && fileCb != null) {
            fileCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            fileCb = null;
        }
        super.onActivityResult(req, res, data);
    }

    @Override
    public void onRequestPermissionsResult(int req, String[] p, int[] r) {
        if (req == REQ_LOC && geoCb != null) {
            geoCb.invoke(geoOrigin, r.length > 0 && r[0] == PackageManager.PERMISSION_GRANTED, false);
            geoCb = null;
        }
        super.onRequestPermissionsResult(req, p, r);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else moveTaskToBack(true);
    }

    @Override
    protected void onSaveInstanceState(Bundle b) {
        super.onSaveInstanceState(b);
        web.saveState(b);
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
