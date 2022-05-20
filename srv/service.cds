using my.syntest from '../db/schema';

@requires : 'authenticated-user'
service CatalogService {
    entity Yamaha as projection on syntest.Yamaha

    type response {
        data : String
    };

    function getUserDetails() returns response;
}
