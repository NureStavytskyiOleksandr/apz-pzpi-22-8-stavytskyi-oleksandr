package com.example.parkingapp

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.example.parkingapp.api.Parking
import com.example.parkingapp.api.RetrofitClient
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun DashboardScreen(
    authManager: AuthManager,
    onParkingSelected: (Int, String) -> Unit,
    onLogout: () -> Unit
) {
    val scope = rememberCoroutineScope()
    var parkings by remember { mutableStateOf<List<Parking>>(emptyList()) }
    var errorMessage by remember { mutableStateOf("") }
    val token = authManager.getToken() ?: ""

    fun refreshData() {
        scope.launch {
            if (token.isEmpty()) {
                errorMessage = "Authentication error. Please log in again."
                authManager.clearAuth()
                onLogout()
                return@launch
            }

            try {
                parkings = RetrofitClient.apiService.getParkingsForUser("Bearer $token")
                errorMessage = ""
            } catch (e: Exception) {
                errorMessage = "Failed to load parkings: ${e.message}"
                println("Error details: $e")
                if (e.message?.contains("403") == true || e.message?.contains("401") == true) {
                    authManager.clearAuth()
                    onLogout()
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        refreshData()
        while (true) {
            delay(30000)
            refreshData()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = stringResource(R.string.welcome_to_dashboard), style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        Text(text = stringResource(R.string.role, authManager.getRole() ?: "user"))
        Spacer(modifier = Modifier.height(16.dp))

        if (errorMessage.isNotEmpty()) {
            Text(text = errorMessage, color = MaterialTheme.colorScheme.error)
            Spacer(modifier = Modifier.height(8.dp))
        }

        if (parkings.isEmpty() && errorMessage.isEmpty()) {
            Text(text = stringResource(R.string.loading_parkings))
        } else if (parkings.isEmpty()) {
            Text(text = stringResource(R.string.no_parkings_available))
        } else {
            LazyColumn {
                items(parkings) { parking ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clickable { onParkingSelected(parking.parkingId, parking.name) },
                        elevation = CardDefaults.cardElevation(4.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(text = parking.name, style = MaterialTheme.typography.titleMedium)
                            Text(text = "Address: ${parking.address}", style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = {
                authManager.clearAuth()
                onLogout()
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(stringResource(R.string.logout))
        }
        Button(
            onClick = { refreshData() },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(stringResource(R.string.refresh))
        }
    }
}