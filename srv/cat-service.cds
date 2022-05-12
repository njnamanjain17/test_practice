using my.bookshop as my from '../db/data-model';

service CatalogService {
    entity Books as projection on my.Books;
    entity Authors as projection on my.Authors;
    @readonly
    entity Book_details as projection on my.books_authors;
}