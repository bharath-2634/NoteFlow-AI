package com.noteflow_ai

import androidx.documentfile.provider.DocumentFile
import android.content.Context
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.DocumentsContract
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    companion object {
        const val REQUEST_CODE_OPEN_DIRECTORY = 42
    }

    override fun getMainComponentName(): String = "NoteFlow_AI"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Always prompt the user to select a directory (you may change this to be user-triggered)
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
            putExtra(
                DocumentsContract.EXTRA_INITIAL_URI,
                Uri.parse("content://com.android.externalstorage.documents/document/primary:WhatsApp%2FMedia%2FWhatsApp%20Documents")
            )
        }
        startActivityForResult(intent, REQUEST_CODE_OPEN_DIRECTORY)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == REQUEST_CODE_OPEN_DIRECTORY && resultCode == Activity.RESULT_OK) {
            data?.data?.let { treeUri ->
                // Take persistable URI permission
                contentResolver.takePersistableUriPermission(
                    treeUri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                )

                Log.d("SAF", "User selected tree URI: $treeUri")

                // Store (or update) the selected URI in SharedPreferences every time
                val prefs = getSharedPreferences("saf_prefs", Context.MODE_PRIVATE)
                prefs.edit().putString("whatsapp_uri", treeUri.toString()).apply()
                Log.d("SAF", "Updated SAF path in SharedPreferences")

                // Optional: log files in selected directory for debugging
                val pickedDir = DocumentFile.fromTreeUri(this, treeUri)
                pickedDir?.listFiles()?.forEach { file ->
                    Log.d("SAF", "File found: ${file.name}")
                }
            }
        }
    }
}
