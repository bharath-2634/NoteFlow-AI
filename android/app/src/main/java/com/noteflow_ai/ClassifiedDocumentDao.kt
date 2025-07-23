package com.noteflow_ai

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Delete
import androidx.room.Update
import androidx.room.OnConflictStrategy
import com.noteflow_ai.ClassifiedDocument


@Dao
interface ClassifiedDocumentDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(doc: ClassifiedDocument)

    @Update
    suspend fun update(doc: ClassifiedDocument)

    @Query("SELECT * FROM classified_documents ORDER BY timestamp DESC")
    suspend fun getAll(): List<ClassifiedDocument>

    @Query("SELECT * FROM classified_documents WHERE status = :status")
    suspend fun getByStatus(status: String): List<ClassifiedDocument>

    @Query("SELECT * FROM classified_documents WHERE uri = :uri LIMIT 1")
    suspend fun getDocumentByUri(uri: String): ClassifiedDocument?
}
