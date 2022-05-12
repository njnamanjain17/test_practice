namespace my.bookshop2;

// entity Books {
//   key ID : Integer;
//   title  : String;
//   stock  : Integer;
// }

@cds.persistence.exists
entity syn_books{
    key ID : Integer;
  title  : String;
   stock  : Integer;
}