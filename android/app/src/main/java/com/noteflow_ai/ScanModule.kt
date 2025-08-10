package com.noteflow_ai

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import androidx.lifecycle.Observer
import androidx.work.OneTimeWorkRequest
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkInfo
import androidx.work.WorkManager
import java.util.UUID

class ScanModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ScanModule"
    }

    @ReactMethod
    fun runOneTimeScan(promise: Promise) {
        try {
            val workRequest: OneTimeWorkRequest = OneTimeWorkRequestBuilder<SimpleLoggerWorker>().build()
            val workId: UUID = workRequest.id

            val workManager = WorkManager.getInstance(reactApplicationContext)
            workManager.enqueue(workRequest)

            // Switch to main thread for LiveData observation
            reactApplicationContext.runOnUiQueueThread {
                workManager.getWorkInfoByIdLiveData(workId).observeForever(object : Observer<WorkInfo> {
                    override fun onChanged(workInfo: WorkInfo) {
                        if (workInfo.state == WorkInfo.State.SUCCEEDED || workInfo.state == WorkInfo.State.FAILED) {
                            workManager.getWorkInfoByIdLiveData(workId).removeObserver(this)
                            if (workInfo.state == WorkInfo.State.SUCCEEDED) {
                                promise.resolve(true)
                            } else {
                                promise.reject("SCAN_FAILED", "Worker failed")
                            }
                        }
                    }
                })
            }

        } catch (e: Exception) {
            promise.reject("SCAN_ERROR", e)
        }
    }

}
