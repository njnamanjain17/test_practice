using my.bookshop2 as my from '../db/data-model';

service CatalogService {
    @readonly entity syn_books as projection on my.syn_books;
}