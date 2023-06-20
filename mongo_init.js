var user = {
    user: "mongo",
    pwd: "mongo",
    roles: [{
        role: "dbOwner",
        db: "app"
    }]
};

db.createUser(user);