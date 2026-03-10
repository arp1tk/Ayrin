import express from "express"

const app = express();

app.use(express.json());

app.get("/",(req,res) =>{
    res.send("hii");
})

app.listen(5000,()=>{
    console.log("app is running")
})