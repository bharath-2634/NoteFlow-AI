package com.noteflow_ai

import android.app.Activity
import android.content.Intent
import android.provider.DocumentsContract
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.*

class SAFModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SAFModule"

    @ReactMethod
    fun openSAFPicker(promise: Promise) {
        val activity = currentActivity
        if (activity != null) {
            try {
                val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
                    putExtra(DocumentsContract.EXTRA_INITIAL_URI, Uri.parse("content://com.android.externalstorage.documents/document/primary:WhatsApp%2FMedia%2FWhatsApp%20Documents"))
                }
                activity.startActivityForResult(intent, MainActivity.REQUEST_CODE_OPEN_DIRECTORY)
                promise.resolve("SAF Picker launched")
            } catch (e: Exception) {
                promise.reject("SAF_ERROR", "Failed to launch SAF picker", e)
            }
        } else {
            promise.reject("SAF_ERROR", "Activity is null")
        }
    }
}
