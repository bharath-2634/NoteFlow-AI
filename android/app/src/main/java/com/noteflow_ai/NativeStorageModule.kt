package com.noteflow_ai

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NativeStorageModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "NativeStorageModule"

    @ReactMethod
    fun saveUserId(userId: String) {
        val sharedPrefs = reactApplicationContext.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
        with(sharedPrefs.edit()) {
            putString("current_user_id", userId)
            apply()
        }
    }
}