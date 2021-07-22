import { Request, RequestParamHandler, Router } from 'express';
import  { nanoid } from 'nanoid';
import { URL } from 'url';
import dns from 'dns';

import util from 'util';

import { ShortURL } from "../entity/ShortURL";

const dnsLookup = util.promisify(dns.lookup);

const router = Router();

const isValidURL = (url: string): boolean =>{
    try{
        new URL(url);
        return true;
    }catch(err){
        return false;
    }
}


router.get('/:alias', async (req: any ,res)=>{
   try{
        const { alias = null } : { alias: string} = req.params;
        const urlObject: ShortURL = await ShortURL.findOne({alias});

        if(!urlObject){
            throw new Error("url doesn't exist");
        }
        return res.redirect(urlObject.url);

    }catch(error){
       return res.status(400).json({
           error: error.message
       })
   }
    
})
router.get("/",(req,res)=>{


    res.status(200).json({
        message:'xus_server version 1.0',
        
    })
})
router.post('/',async (req,res)=>{
    try{

    let { url = null, alias = null } : { url: string, alias: string } = req.body;

    const isValidAlias : boolean = /[0-9a-z_\-A-Z]{4,10}/.test(alias);

    if(alias === null){
        alias = nanoid(10);
    }

    if(!isValidAlias){
        throw new Error("invalid alias")
    }

    const _isValidURL: boolean = !!url;

    if( !_isValidURL || !isValidURL(url)){
        throw new Error('url is not valid!');
    }

    const _url: URL = new URL(url);


    const _urlInfo = await dnsLookup(_url.hostname);

    let isAliasExists: ShortURL = await ShortURL.findOne({ alias });
    
    
    if(isAliasExists){
        throw new Error("Alias exists");
    }

    let urlObject: ShortURL = await ShortURL.findOne({ url: _url.href })
    
    if(!urlObject){
        urlObject = new ShortURL();
        urlObject.alias = alias;
        urlObject.url = _url.href;
    }
    await urlObject.save()

    const shortURL = `${req.baseUrl}/${urlObject.alias}`;

    return res.status(200).json({
       shortURL
    });
    
    }catch(error){
        res.status(400).json({
            message: 'something went wrong!',
            _error: error.message
        })
    }
})


export default router;
