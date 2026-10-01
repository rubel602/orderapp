package com.example.orderapp

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class Order(val id: String = "", val userEmail: String = "", val item: String = "",
                 val qty: Long = 1, val status: String = "PENDING", val createdAt: Long = 0)

// Backend = Google Sheet via Apps Script web app. Paste your web app URL below.
object Repo {
    const val SCRIPT_URL = "PASTE_YOUR_WEB_APP_URL_HERE"
    private lateinit var prefs: SharedPreferences
    fun init(c: Context) { prefs = c.getSharedPreferences("app", Context.MODE_PRIVATE) }

    private var token: String?
        get() = prefs.getString("token", null)
        set(v) { prefs.edit().putString("token", v).apply() }
    var email: String
        get() = prefs.getString("email", "") ?: ""
        private set(v) { prefs.edit().putString("email", v).apply() }
    val loggedIn get() = token != null

    private suspend fun call(body: JSONObject): JSONObject = withContext(Dispatchers.IO) {
        token?.let { body.put("token", it) }
        val c = URL(SCRIPT_URL).openConnection() as HttpURLConnection
        c.requestMethod = "POST"; c.doOutput = true; c.connectTimeout = 15000; c.readTimeout = 20000
        c.setRequestProperty("Content-Type", "text/plain")
        c.outputStream.use { it.write(body.toString().toByteArray()) }
        val r = JSONObject(c.inputStream.bufferedReader().readText())
        if (r.has("error")) throw Exception(r.getString("error"))
        r
    }
    private fun req(action: String, vararg kv: Pair<String, Any>) =
        JSONObject().put("action", action).also { j -> kv.forEach { j.put(it.first, it.second) } }

    suspend fun login(e: String, pw: String) {
        token = call(req("login", "email" to e, "password" to pw)).getString("token"); email = e.lowercase()
    }
    suspend fun register(e: String, pw: String) {
        token = call(req("register", "email" to e, "password" to pw)).getString("token"); email = e.lowercase()
    }
    fun logout() { token = null }
    suspend fun role(): String = call(req("me")).getString("role")
    suspend fun changePassword(old: String, new: String) { call(req("changePassword", "oldPassword" to old, "newPassword" to new)) }
    suspend fun createOrder(item: String, qty: Long) { call(req("createOrder", "item" to item, "qty" to qty)) }
    suspend fun setStatus(id: String, status: String) { call(req("setStatus", "id" to id, "status" to status)) }

    // Polls the sheet every 5 seconds so status changes show up automatically.
    fun orders(all: Boolean): Flow<List<Order>> = flow {
        while (true) {
            val r = try { call(req("orders")) } catch (e: Exception) { null }
            if (r != null) {
                val a = r.getJSONArray("orders")
                emit((0 until a.length()).map { a.getJSONObject(it) }.map {
                    Order(it.optString("id"), it.optString("userEmail"), it.optString("item"),
                          it.optLong("qty", 1), it.optString("status"), it.optLong("createdAt"))
                }.sortedByDescending { it.createdAt })
            }
            delay(5000)
        }
    }
}
