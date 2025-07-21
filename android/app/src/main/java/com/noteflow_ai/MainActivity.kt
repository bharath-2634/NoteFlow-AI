package com.noteflow_ai

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.DocumentsContract
import android.util.Log
import androidx.documentfile.provider.DocumentFile
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    companion object {
        const val REQUEST_CODE_OPEN_DIRECTORY = 42
        const val PREF_NAME = "saf_prefs"
        const val KEY_URI = "whatsapp_uri"
    }

    override fun getMainComponentName(): String = "NoteFlow_AI"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val prefs = getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val savedUri = prefs.getString(KEY_URI, null)

        if (savedUri == null) {
            // SAF path not yet picked, launch picker
            Log.d("SAF", "No saved SAF URI found, prompting user.")
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
                putExtra(
                    DocumentsContract.EXTRA_INITIAL_URI,
                    Uri.parse("content://com.android.externalstorage.documents/document/primary:WhatsApp%2FMedia%2FWhatsApp%20Documents")
                )
            }
            startActivityForResult(intent, REQUEST_CODE_OPEN_DIRECTORY)
        } else {
            // SAF URI already saved
            Log.d("SAF", "SAF URI already saved: $savedUri")
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == REQUEST_CODE_OPEN_DIRECTORY && resultCode == Activity.RESULT_OK) {
            data?.data?.let { treeUri ->
                // Persist permission
                contentResolver.takePersistableUriPermission(
                    treeUri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                )

                // Save URI to shared preferences
                val prefs = getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
                prefs.edit().putString(KEY_URI, treeUri.toString()).apply()
                Log.d("SAF", "SAF path saved: $treeUri")

                // Log files for debug
                val pickedDir = DocumentFile.fromTreeUri(this, treeUri)
                pickedDir?.listFiles()?.forEach { file ->
                    Log.d("SAF", "File found: ${file.name}")
                }
            }
        }
    }
}
