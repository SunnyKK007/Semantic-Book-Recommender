from app.api import db_books
results = db_books.similarity_search_with_score("book of war", k=5)
for doc, score in results:
    print(score, doc.metadata.get("title"))
