package com.noteflow_ai

class DocumentRepository(private val dao: ClassifiedDocumentDao) {
    suspend fun insert(doc: ClassifiedDocument) = dao.insert(doc)
    suspend fun update(doc: ClassifiedDocument) = dao.update(doc)
    suspend fun getAll() = dao.getAll()
    suspend fun getByStatus(status: String) = dao.getByStatus(status)
    suspend fun getDocumentByUri(uri: String) = dao.getDocumentByUri(uri)
}
