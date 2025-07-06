package com.noteflow_ai

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [ClassifiedDocument::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun documentDao(): ClassifiedDocumentDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "classified_documents_db"
                ).build().also { INSTANCE = it }
            }
        }
    }
}
