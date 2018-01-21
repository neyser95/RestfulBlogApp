var express          = require("express"),
    app              = express(),
    mongoose         = require("mongoose"),
    bodyParser       = require("body-parser"),
    methodO          = require("method-override"),
    expressSanitizer = require("express-sanitizer");
 
// APP Config

//connect to mongo with mongoose
mongoose.connect('mongodb://localhost/restful_blog_app', {useMongoClient: true});

//to be able to use ejs in view folder
app.set("view engine", "ejs");

//to use external css & js files in the public folder
app.use(express.static("public"));

//to enable body-parser in our app
app.use(bodyParser.urlencoded({extended: true}));

//Method-override
app.use(methodO('_method')) ;

//Sanitizer
app.use(expressSanitizer());

//Mongoose/Model Config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body:  String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//RESTful routes

app.get("/", function(req, res){
   res.redirect("/blogs");
});

//Index Route
app.get("/blogs", function(req, res){
   Blog.find({}, function(err, blogs){
      if(err){
          console.log("ERROR!");
      }else{
          res.render("index", {blogs: blogs});
      }
   }); 
});

//New Route
app.get("/blogs/new", function(req, res){
   res.render("new"); 
});

//Create Route
app.post("/blogs", function(req, res){
    //create blog 
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
       if(err){
           res.render("new");
       } else{
           //then, redirect to th index page
           res.redirect("/blogs");
       }
    });
});

//Show Route
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id ,function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else{
            res.render("show", {blog: foundBlog});
       }
    });
});

//Edit Route
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//Update Route
app.put("/blogs/:id", function(req, res){
   req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/" + req.params.id);
        }
    }); 
});

//Destroy Route
app.delete("/blogs/:id", function(req, res){
   //destroy blog
   Blog.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/blogs");
      } else{
          res.redirect("/blogs");
      }
   });
});

//Set up our server
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("server has started."); 
});