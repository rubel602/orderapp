package com.example.orderapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Repo.init(this)
        setContent { MaterialTheme { Surface(Modifier.fillMaxSize()) { App() } } }
    }
}

@Composable fun App() {
    var loggedIn by remember { mutableStateOf(Repo.loggedIn) }
    if (!loggedIn) LoginScreen { loggedIn = true }
    else Home { Repo.logout(); loggedIn = false }
}

@Composable fun LoginScreen(onDone: () -> Unit) {
    var email by remember { mutableStateOf("") }; var pw by remember { mutableStateOf("") }
    var msg by remember { mutableStateOf("") }; val scope = rememberCoroutineScope()
    fun run(block: suspend () -> Unit) = scope.launch {
        try { block(); onDone() } catch (e: Exception) { msg = e.message ?: "Error" }
    }
    Column(Modifier.padding(24.dp).fillMaxSize(), Arrangement.spacedBy(12.dp, androidx.compose.ui.Alignment.CenterVertically)) {
        Text("Order App", style = MaterialTheme.typography.headlineMedium)
        OutlinedTextField(email, { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(pw, { pw = it }, label = { Text("Password") }, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth())
        Button({ run { Repo.login(email.trim(), pw) } }, Modifier.fillMaxWidth()) { Text("Login") }
        OutlinedButton({ run { Repo.register(email.trim(), pw) } }, Modifier.fillMaxWidth()) { Text("Register") }
        if (msg.isNotEmpty()) Text(msg, color = MaterialTheme.colorScheme.error)
    }
}

@Composable fun Home(onLogout: () -> Unit) {
    var isManager by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { isManager = runCatching { Repo.role() == "manager" }.getOrDefault(false) }
    val tabs = listOf("My Orders", "New Order", "Account") + if (isManager) listOf("Manager") else emptyList()
    var tab by remember { mutableStateOf(0) }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ScrollableTabRow(tab) { tabs.forEachIndexed { i, t -> Tab(tab == i, { tab = i }) { Text(t, Modifier.padding(12.dp)) } } }
        when (tabs[tab]) {
            "My Orders" -> OrdersList(false)
            "New Order" -> NewOrder { tab = 0 }
            "Account" -> Account(onLogout)
            else -> OrdersList(true)
        }
    }
}

@Composable fun OrdersList(manager: Boolean) {
    val orders by remember(manager) { Repo.orders(manager) }.collectAsState(emptyList())
    val scope = rememberCoroutineScope()
    LazyColumn(Modifier.padding(12.dp)) {
        items(orders) { o ->
            Card(Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
                Column(Modifier.padding(12.dp)) {
                    Text("${o.item} x${o.qty}", style = MaterialTheme.typography.titleMedium)
                    if (manager) Text(o.userEmail)
                    Text("Delivery status: ${o.status}")
                    if (manager) Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        fun set(s: String) = scope.launch { Repo.setStatus(o.id, s) }
                        when (o.status) {
                            "PENDING" -> { Button({ set("APPROVED") }) { Text("Approve") }
                                           OutlinedButton({ set("REJECTED") }) { Text("Reject") } }
                            "APPROVED" -> Button({ set("SHIPPED") }) { Text("Mark shipped") }
                            "SHIPPED" -> Button({ set("DELIVERED") }) { Text("Mark delivered") }
                        }
                    }
                }
            }
        }
    }
}

@Composable fun NewOrder(onDone: () -> Unit) {
    var item by remember { mutableStateOf("") }; var qty by remember { mutableStateOf("1") }
    val scope = rememberCoroutineScope()
    Column(Modifier.padding(24.dp).fillMaxWidth(), Arrangement.spacedBy(12.dp)) {
        OutlinedTextField(item, { item = it }, label = { Text("Item") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(qty, { qty = it.filter(Char::isDigit) }, label = { Text("Quantity") }, modifier = Modifier.fillMaxWidth())
        Button({ scope.launch { Repo.createOrder(item.trim(), qty.toLongOrNull() ?: 1); onDone() } },
            enabled = item.isNotBlank()) { Text("Place order") }
    }
}

@Composable fun Account(onLogout: () -> Unit) {
    var old by remember { mutableStateOf("") }; var new by remember { mutableStateOf("") }
    var msg by remember { mutableStateOf("") }; val scope = rememberCoroutineScope()
    Column(Modifier.padding(24.dp).fillMaxWidth(), Arrangement.spacedBy(12.dp)) {
        Text(Repo.email)
        OutlinedTextField(old, { old = it }, label = { Text("Current password") }, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth())
        OutlinedTextField(new, { new = it }, label = { Text("New password (6+ chars)") }, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth())
        Button({ scope.launch { msg = try { Repo.changePassword(old, new); "Password changed" } catch (e: Exception) { e.message ?: "Error" } } }) { Text("Change password") }
        if (msg.isNotEmpty()) Text(msg)
        OutlinedButton(onLogout) { Text("Log out") }
    }
}
