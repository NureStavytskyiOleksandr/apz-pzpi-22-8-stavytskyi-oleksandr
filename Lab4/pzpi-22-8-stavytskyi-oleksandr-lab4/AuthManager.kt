package com.example.parkingapp

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import com.auth0.jwt.JWT
import com.auth0.jwt.interfaces.DecodedJWT

class AuthManager(private val context: Context) {
    private val sharedPreferences = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)

    fun saveAuth(token: String, role: String, userId: Int? = null) {
        sharedPreferences.edit()
            .putString("token", token)
            .putString("role", role)
            .putInt("user_id", userId ?: decodeUserIdFromToken(token) ?: -1)
            .apply()
    }

    fun getToken(): String? {
        return sharedPreferences.getString("token", null)
    }

    fun getRole(): String? {
        return sharedPreferences.getString("role", null)
    }

    fun getUserId(): Int? {
        val userId = sharedPreferences.getInt("user_id", -1)
        return if (userId != -1) userId else null
    }

    fun clearAuth() {
        sharedPreferences.edit().clear().apply()
    }

    private fun decodeUserIdFromToken(token: String): Int? {
        return try {
            val decodedJWT: DecodedJWT = JWT.decode(token)
            decodedJWT.getClaim("user_id").asInt()
        } catch (e: Exception) {
            println("Error decoding token: ${e.message}")
            null
        }
    }
}

@Composable
fun rememberAuthManager(): AuthManager {
    val context = LocalContext.current
    return remember { AuthManager(context) }
}