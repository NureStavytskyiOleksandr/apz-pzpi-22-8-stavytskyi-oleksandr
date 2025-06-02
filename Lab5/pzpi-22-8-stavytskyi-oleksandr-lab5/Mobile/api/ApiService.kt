package com.example.parkingapp.api

import com.google.gson.annotations.SerializedName
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String,
    val role: String = "user"
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    @SerializedName("token") val token: String? = null,
    @SerializedName("role") val role: String? = null,
    @SerializedName("user_id") val userId: Int? = null,
    @SerializedName("username") val username: String? = null,
    @SerializedName("email") val email: String? = null
)

data class Parking(
    @SerializedName("parking_id") val parkingId: Int,
    @SerializedName("name") val name: String,
    @SerializedName("address") val address: String
)

data class UserGroup(
    @SerializedName("group_id") val groupId: Int,
    @SerializedName("group_name") val groupName: String,
    @SerializedName("description") val description: String? = null,
    @SerializedName("parking_id") val parkingId: Int?
)

data class AccessLink(
    @SerializedName("group_id") val groupId: Int,
    @SerializedName("parking_group_id") val parkingGroupId: Int
)

data class ParkingGroup(
    @SerializedName("parking_group_id") val parkingGroupId: Int,
    @SerializedName("group_name") val groupName: String,
    @SerializedName("parking_id") val parkingId: Int
)

data class ParkingSpot(
    @SerializedName("spot_id") val spotId: Int,
    @SerializedName("parking_group_id") val parkingGroupId: Int,
    @SerializedName("spot_number") val spotNumber: String,
    @SerializedName("is_occupied") val isOccupied: Boolean
)

interface ApiService {
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @GET("parkings")
    suspend fun getParkings(
        @Header("Authorization") token: String
    ): List<Parking>

    @GET("parkings/for-user")
    suspend fun getParkingsForUser(
        @Header("Authorization") token: String
    ): List<Parking>

    @GET("user-groups")
    suspend fun getUserGroups(
        @Header("Authorization") token: String
    ): List<UserGroup>

    @GET("user-group-parking-group-access")
    suspend fun getAccessLinks(
        @Header("Authorization") token: String
    ): List<AccessLink>

    @GET("parking-groups")
    suspend fun getParkingGroups(
        @Header("Authorization") token: String
    ): List<ParkingGroup>

    @GET("parking-spots/available-for-user")
    suspend fun getAvailableSpotsForUser(
        @Header("Authorization") token: String
    ): List<ParkingSpot>

    @GET("parking-spots/available-for-user-in-parking/{parking_id}")
    suspend fun getAvailableSpotsForUserInParking(
        @Header("Authorization") token: String,
        @Path("parking_id") parkingId: Int
    ): List<ParkingSpot>
}

object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:3000/"

    val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
