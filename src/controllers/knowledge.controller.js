// ======================================
// controllers/knowledge.controller.js
// Layboka AI
// Knowledge Controller
// Production Ready
// Imports + List + Create Knowledge
// PART 1
// ======================================

const Knowledge =
require("../models/Knowledge");

// ======================================
// LIST
// ======================================

exports.list =
async(req,res)=>{

    try{

        const shop =

            req.shop ||

            req.query.shop ||

            req.body.shop;

        if(!shop){

            return res.status(400).json({

                success:false,

                message:"Shop is required."

            });

        }

        const knowledge =

            await Knowledge.find({

                shop

            })

            .sort({

                updatedAt:-1

            });

        return res.json({

            success:true,

            total:

                knowledge.length,

            knowledge

        });

    }

    catch(error){

        console.error(

            "Knowledge List Error",

            error

        );

        return res.status(500).json({

            success:false,

            message:"Internal Server Error."

        });

    }

};

// ======================================
// CREATE
// ======================================

exports.create =
async(req,res)=>{

    try{

        const {

            shop,

            title,

            category,

            content,

            keywords=[]

        } = req.body;

        if(

            !shop ||

            !title ||

            !content

        ){

            return res.status(400).json({

                success:false,

                message:

                "Missing required fields."

            });

        }

        const item =

            await Knowledge.create({

                shop,

                title,

                category,

                content,

                keywords

            });

        return res.json({

            success:true,

            knowledge:item

        });

    }

    catch(error){

        console.error(

            "Knowledge Create Error",

            error

        );

        return res.status(500).json({

            success:false,

            message:"Internal Server Error."

        });

    }

};
// ======================================
// UPDATE
// ======================================

exports.update =
async(req,res)=>{

    try{

        const id =

            req.params.id;

        const {

            title,

            category,

            content,

            keywords

        } = req.body;

        const knowledge =

            await Knowledge.findByIdAndUpdate(

                id,

                {

                    title,

                    category,

                    content,

                    keywords

                },

                {

                    new:true

                }

            );

        if(!knowledge){

            return res.status(404).json({

                success:false,

                message:

                    "Knowledge not found."

            });

        }

        return res.json({

            success:true,

            knowledge

        });

    }

    catch(error){

        console.error(

            "Knowledge Update Error",

            error

        );

        return res.status(500).json({

            success:false,

            message:

                "Internal Server Error."

        });

    }

};

// ======================================
// DELETE
// ======================================

exports.remove =
async(req,res)=>{

    try{

        const id =

            req.params.id;

        const knowledge =

            await Knowledge.findByIdAndDelete(

                id

            );

        if(!knowledge){

            return res.status(404).json({

                success:false,

                message:

                    "Knowledge not found."

            });

        }

        return res.json({

            success:true,

            message:

                "Knowledge deleted."

        });

    }

    catch(error){

        console.error(

            "Knowledge Delete Error",

            error

        );

        return res.status(500).json({

            success:false,

            message:

                "Internal Server Error."

        });

    }

};

// ======================================
// SEARCH
// ======================================

exports.search =
async(req,res)=>{

    try{

        const shop =

            req.query.shop;

        const keyword =

            req.query.keyword ||

            "";

        const knowledge =

            await Knowledge.find({

                shop,

                $or:[

                    {

                        title:{

                            $regex:keyword,

                            $options:"i"

                        }

                    },

                    {

                        content:{

                            $regex:keyword,

                            $options:"i"

                        }

                    },

                    {

                        keywords:{

                            $in:[

                                new RegExp(

                                    keyword,

                                    "i"

                                )

                            ]

                        }

                    }

                ]

            });

        return res.json({

            success:true,

            total:

                knowledge.length,

            knowledge

        });

    }

    catch(error){

        console.error(

            "Knowledge Search Error",

            error

        );

        return res.status(500).json({

            success:false,

            message:

                "Internal Server Error."

        });

    }

};

// ======================================
// HEALTH
// ======================================

exports.health =
async(req,res)=>{

    return res.json({

        success:true,

        service:

            "Knowledge",

        status:

            "running",

        timestamp:

            new Date()

    });

};

// ======================================
// EXPORT
// ======================================

module.exports =

exports;
