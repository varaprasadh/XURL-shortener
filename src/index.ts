import "reflect-metadata";
import {createConnection} from "typeorm";

import express from 'express';
import cors from 'cors';

import  router from "./handlers/index"


const app =  express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(router);





const PORT =  process.env.PORT || 3000;

(async ()=>{
    const connection = await createConnection();
    app.listen(PORT, ()=>{
        console.log(`xus running at port: ${PORT}`);
    })
})()



// createConnection().then(async connection => {


  

// }).catch(error => console.log(error));
