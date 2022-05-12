namespace my.bookshop;

using {managed} from '@sap/cds/common';


entity Books : managed {
    key ID     : Integer;
        title  : String;
        stock  : Integer;
        author : Integer;
}

entity Authors : managed {
    key ID   : Integer;
        name : String(40);
}

view books_authors as select 
    key Books.ID,
        title,
        stock,
        name
from 
Books inner join Authors on Books.author = Authors.ID;
