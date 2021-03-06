const express = require("express");
const Sequelize = require("sequelize");
const sequelize = require("./database/connection");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const path =require("path");
const User = require("./models/User");
const Repository = require("./models/Repository");
const _ = require('lodash');
const bcrypt = require("bcrypt");
const { result } = require("lodash");
require('dotenv').config()


const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("views"));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
 
//Global Variables

var errorMessage = "";
var globalFirstName="";
var globalId = "";
var repMessage = "";

var globalRepositoryIds = [];
var globalRepositoryNames = [];
var globalRepositoryDescriptions = [];
var repoID = "";
var dataLength =0;

var grId = "";
var grName = "";
var grDescription = "";
var grUserId = "";
var dataSize = 0;

var globalAllRepoIds = [];
var globalAllrepoNames = [];
var globalAllRepoDescriptions = [];
var globalAllUserIds = [];
var hashedPassword ="";

app.get("/", (req, res) =>{

    sequelize.authenticate()
    .then(() => {console.log("CRUD app DB connection successful!")})
    .catch((err) =>{console.log("CRUD App DB Connection Error" + err)});
    res.render("home");


});

app.get("/signin", (req, res)=>{

    errorMessage = ""
    res.render("signin", {errorMessage:errorMessage})

});

app.get("/signup", (req, res)=>{
    
    res.render("signup");

});

app.post("/signup", async(req, res)=>{

    const firstNameEntered = req.body.firstNameInput;
    const lastNameEntered = req.body.lastNameInput;
    const emailEntered = req.body.emailInput;
    const passwordEntered = req.body.passwordInput;
    
   if(firstNameEntered =="" || lastNameEntered =="" || emailEntered == "" || passwordEntered =="")
   {
    res.render("signup");
   }
   else{

    const saltRounds = 8
    hashedPassword = await bcrypt.hash(passwordEntered, saltRounds);
    console.log("Password Hashed");
   
    return User.create({

        firstName:firstNameEntered,
        lastName:lastNameEntered,
        email:emailEntered,
        password:hashedPassword

    })
    .then(()=>{
        console.log("User Registed Successfully.");
        res.render("signin");
    })
    
    .catch((err) =>{
        console.log(`Error: ${err}`);
        res.render("signup");
    });
}
});


app.post("/signin", async (req, res)=>{

     //Getting the signed in data.
    const email=req.body.siEmailTyped;
    const password2 = req.body.siPasswordTyped;

    User.findOne({where:{email:email}})
    .then((data)=>{
        if(data !=null)
        {
            const {id, firstName, email, password} = data;
            hashedPassword = password;
            bcrypt.compare(password2, hashedPassword, (err, result) =>{

                if(result){

                    console.log("Password Matched");
                    globalFirstName=firstName;
                    globalId = id;
                    globalEmail = email;
                    res.redirect("/dashboard/"+id);
                }
                else{

                    console.log(`Invalid Password`);
                    errorMessage = "Invalid Email or Password."
                    globalId="";
                    res.render("signin", {errorMessage:errorMessage});
                }
            });
        }
        else{
            res.render("signin", {errorMessage:errorMessage});
        }
    })
    .catch((err)=>{console.log(err)});
});

app.get("/dashboard/:id", (req, res)=>{

    globalId = req.params.id;
    console.log(`Signed in with ID: ${globalId}`);

    Repository.findAll({raw:true}, {order: [['id', 'ASC']]})
    .then((data)=>{
        console.log(data);
        dataSize = _.size(data);
    
        for(let a=0; a<=dataSize-1; a++)
        {
         globalAllRepoIds.push(data[a].id);
         globalAllrepoNames.push(data[a].repositoryName);
         globalAllRepoDescriptions.push(data[a].repositoryDescription);
         globalAllUserIds.push(data[a].userId)
            
        }
       

        res.render('dashboard', {   globalId:globalId, 
                                    globalFirstName: globalFirstName,
                                    dataSize:dataSize, 
                                    globalAllRepoIds:globalAllRepoIds, 
                                    globalAllrepoNames:globalAllrepoNames, 
                                    globalAllRepoDescriptions:globalAllRepoDescriptions,  
                                    globalAllUserIds: globalAllUserIds  });
       
    })
    .catch((err)=>{console.log(err)});

});

app.get("/deleteUser", (req, res)=>{

    User.destroy({where:{id:globalId}})
    .then(() => {
        console.log("User Deleted Successfully!");
    })
    .catch((err)=>{console.log(err)});

    res.redirect("/signin");

});


app.get("/editUser", (req, res)=>{

    // Logic to get data from selected Repository to Selected Repository with ID page. 
    User.findOne({where:{id:globalId}})
    .then((data)=>{

        if(data != null){
            const {firstName, lastName, email, password} = data;
            res.render("editUser", { firstName:firstName, 
                                     lastName: lastName, 
                                     email:email, 
                                     password:password });
        }
    })
    .catch((err)=>{console.log(err)});

});

app.post("/editUser", (req, res)=>{

const firstName = req.body.fName;
const lName = req.body.lName;
const email = req.body.email;
const password = req.body.pass;

User.update({firstName:firstName, lastName:lName, email:email, password:password}, {where: {id: globalId}})
.then(()=>{
    console.log("User Updated Successfully");
    res.render('dashboard', {   globalId:globalId,
                                globalFirstName: globalFirstName,
                                dataSize:dataSize,
                                globalAllRepoIds:globalAllRepoIds, 
                                globalAllrepoNames:globalAllrepoNames, 
                                globalAllRepoDescriptions:globalAllRepoDescriptions,  
                                globalAllUserIds: globalAllUserIds   });            
})
.catch((err)=>{console.log(err)});

});

app.get("/createRepository", (req, res)=>{

    repMessage="";
    res.render("createRepository", {repMessage:repMessage});

});

app.post("/createRepository", (req, res)=>{

    const rname= req.body.repoNameInput;
    const rdescr= req.body.repoDescriptionInput;

    if(globalId=="")
    {
        console.log("No ID");
        repMessage = "Sign in to Create Repository";
        res.render("createRepository", {repMessage:repMessage}); 
    }

    return Repository.create({
        repositoryName:rname,
        repositoryDescription:rdescr,
        userId:globalId
    })
    .then(() =>{
         repMessage = "Repository Created";
         console.log(`Repository Created with ID: ${globalId}`);

         globalAllRepoIds = [];
         globalAllrepoNames = [];
         globalAllRepoDescriptions = [];
         globalAllUserIds = [];

         Repository.findAll({raw:true}, {order: [['id', 'ASC']]})
         .then((data)=>{
             console.log(data);
             dataSize = _.size(data);
         
             for(let a=0; a<=dataSize-1; a++)
             {
              globalAllRepoIds.push(data[a].id);
              globalAllrepoNames.push(data[a].repositoryName);
              globalAllRepoDescriptions.push(data[a].repositoryDescription);
              globalAllUserIds.push(data[a].userId);
                
             }
             res.render('dashboard', {  globalFirstName: globalFirstName,
                                        userId:globalId, dataSize:dataSize, 
                                        globalAllRepoIds:globalAllRepoIds, 
                                        globalAllrepoNames:globalAllrepoNames, 
                                        globalAllRepoDescriptions:globalAllRepoDescriptions,  
                                        globalAllUserIds: globalAllUserIds });
         })
         .catch((err)=>{console.log(err)});
    })
    .catch((err)=>{console.log(err)});
});

app.get("/yourRepositories", (req, res)=>{

    const repos = Repository.findAll({where:{userId: globalId},}, {raw:true})
    .then((data) =>{

        globalAllRepositoryIds = [];
        globalRepositoryNames = [];
        globalRepositoryDescriptions = [];
        dataLength = _.size(data);


        for(let a=0; a<=data.length-1; a++)
        {
            globalRepositoryIds.push(data[a].id);
            globalRepositoryNames.push(data[a].repositoryName);
            globalRepositoryDescriptions.push(data[a].repositoryDescription);
        
        }
      res.render("yourRepositories", {  globalRepositoryIds:globalRepositoryIds,
                                        globalRepositoryNames:globalRepositoryNames,
                                        globalRepositoryDescriptions:globalRepositoryDescriptions, 
                                        dataLength:dataLength   });
    })
    .catch((err)=>{console.log(err)});

});

app.get("/selectedRepository/:id", (req, res)=>{

   repoID = req.params.id;
   console.log("Repo ID from get request: "+repoID);
   // Logic to get data based on repoID and showing it on the form.

   Repository.findOne({where:{id:repoID}})
       .then((data)=>{
        
        // Data filling in form logic based on Repository ID.
           if(data != null){
               const {repositoryName, repositoryDescription} = data;
               res.render("selectedRepository", {

                                                     repositoryName:repositoryName,
                                                     repositoryDescription: repositoryDescription
                                                
                                                });
           }
       })
       .catch((err)=>{console.log(err)});
});

app.post("/selectedRepository", (req, res) =>{

 const repName = req.body.selectRepoNameInput;
 const repDescription = req.body.selectRepoDescriptionInput;

 Repository.update({repositoryName:repName, repositoryDescription:repDescription}, {where: {id: repoID}})
.then((data)=>{
    console.log("Repository Updated Successfully");
    console.log(data);

    const repos = Repository.findAll({raw:true})
    .then((data) =>{

        dataSize = _.size(data);

            globalAllRepoIds = [];
            globalAllrepoNames = [];
            globalAllRepoDescriptions = [];
            globalAllUserIds = [];

        for(let a=0; a<=data.length-1; a++)
        {
            globalAllRepoIds.push(data[a].id);
            globalAllrepoNames.push(data[a].repositoryName);
            globalAllRepoDescriptions.push(data[a].repositoryDescription);
            globalAllUserIds.push(data[a].userId)
        
        }
        res.render('dashboard', {   globalId:globalId, 
                                    globalFirstName: globalFirstName,
                                    dataSize:dataSize, 
                                    globalAllRepoIds:globalAllRepoIds, 
                                    globalAllrepoNames:globalAllrepoNames, 
                                    globalAllRepoDescriptions:globalAllRepoDescriptions,  
                                    globalAllUserIds: globalAllUserIds  });
    })
    .catch((err)=>{console.log(err)}); 
})
.catch((err)=>{console.log(err)});
});

 
app.get("/deleteRepository", (req, res)=>{

    Repository.destroy({where:{id:repoID}})
    .then(() => {
        console.log("Repository Deleted Successfully!");
        
        Repository.findAll({raw:true})
        .then((data)=>{
            console.log(data);
            dataSize = _.size(data);

            globalAllRepoIds = [];
            globalAllrepoNames = [];
            globalAllRepoDescriptions = [];
            globalAllUserIds= [];

            for(let a=0; a<=dataSize-1; a++)
            {
             globalAllRepoIds.push(data[a].id);
             globalAllrepoNames.push(data[a].repositoryName);
             globalAllRepoDescriptions.push(data[a].repositoryDescription);
             globalAllUserIds.push(data[a].userId)
                
            }
           
            res.render('dashboard', {   globalId:globalId, 
                                        globalFirstName: globalFirstName,
                                        dataSize:dataSize, 
                                        globalAllRepoIds:globalAllRepoIds,
                                        globalAllrepoNames:globalAllrepoNames, 
                                        globalAllRepoDescriptions:globalAllRepoDescriptions,  
                                        globalAllUserIds: globalAllUserIds  });
           
        })
        .catch((err)=>{console.log(err)});
    })
    .catch((err)=>{console.log(err)});
 });
 
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {console.log(`CRUD app server running on Port ${PORT}`)});

