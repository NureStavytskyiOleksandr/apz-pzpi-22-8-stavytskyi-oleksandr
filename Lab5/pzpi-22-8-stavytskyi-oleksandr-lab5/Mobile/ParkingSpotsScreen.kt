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
import com.example.parkingapp.api.ParkingSpot
import com.example.parkingapp.api.RetrofitClient
import kotlinx.coroutines.launch

@Composable
fun ParkingSpotsScreen(
    authManager: AuthManager,
    parkingId: Int,
    parkingName: String,
    onBack: () -> Unit
) {
    val scope = rememberCoroutineScope()
    var spots by remember { mutableStateOf<List<ParkingSpot>>(emptyList()) }
    var errorMessage by remember { mutableStateOf("") }
    val token = authManager.getToken() ?: ""

    fun loadSpots() {
        scope.launch {
            if (token.isEmpty()) {
                errorMessage = "Authentication error. Please log in again."
                authManager.clearAuth()
                onBack()
                return@launch
            }

            try {
                spots = RetrofitClient.apiService.getAvailableSpotsForUserInParking("Bearer $token", parkingId)
                errorMessage = ""
            } catch (e: Exception) {
                errorMessage = "Failed to load parking spots: ${e.message}"
                println("Error details: $e")
                if (e.message?.contains("403") == true || e.message?.contains("401") == true) {
                    authManager.clearAuth()
                    onBack()
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        loadSpots()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = stringResource(R.string.available_spots_in, parkingName),
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))

        if (errorMessage.isNotEmpty()) {
            Text(text = errorMessage, color = MaterialTheme.colorScheme.error)
            Spacer(modifier = Modifier.height(8.dp))
        }

        if (spots.isEmpty() && errorMessage.isEmpty()) {
            Text(text = stringResource(R.string.loading_parking_spots))
        } else if (spots.isEmpty()) {
            Text(text = stringResource(R.string.no_available_spots))
        } else {
            LazyColumn {
                items(spots) { spot ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        elevation = CardDefaults.cardElevation(4.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = stringResource(R.string.spot_number, spot.spotNumber),
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text(
                                text = stringResource(R.string.parking_group_id, spot.parkingGroupId),
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = { onBack() },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(stringResource(R.string.back_to_dashboard))
        }
    }
}