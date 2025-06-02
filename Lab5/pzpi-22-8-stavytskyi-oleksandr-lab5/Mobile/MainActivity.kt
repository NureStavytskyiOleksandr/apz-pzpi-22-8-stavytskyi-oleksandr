package com.example.parkingapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.parkingapp.ui.theme.ParkingAppTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ParkingAppTheme {
                val navController = rememberNavController()
                val authManager = rememberAuthManager()

                NavHost(navController = navController, startDestination = "login") {
                    composable("login") {
                        LoginScreen(
                            onLoginSuccess = { navController.navigate("dashboard") },
                            onNavigateToRegister = { navController.navigate("register") },
                            authManager = authManager
                        )
                    }
                    composable("register") {
                        RegisterScreen(
                            onRegisterSuccess = { navController.navigate("dashboard") },
                            onNavigateToLogin = { navController.navigate("login") },
                            authManager = authManager
                        )
                    }
                    composable("dashboard") {
                        DashboardScreen(
                            authManager = authManager,
                            onParkingSelected = { parkingId, parkingName ->
                                navController.navigate("parking_spots/$parkingId/$parkingName")
                            },
                            onLogout = { navController.navigate("login") }
                        )
                    }
                    composable("parking_spots/{parkingId}/{parkingName}") { backStackEntry ->
                        val parkingId = backStackEntry.arguments?.getString("parkingId")?.toIntOrNull() ?: 0
                        val parkingName = backStackEntry.arguments?.getString("parkingName") ?: "Unknown Parking"
                        ParkingSpotsScreen(
                            authManager = authManager,
                            parkingId = parkingId,
                            parkingName = parkingName,
                            onBack = { navController.popBackStack() }
                        )
                    }
                }
            }
        }
    }
}
