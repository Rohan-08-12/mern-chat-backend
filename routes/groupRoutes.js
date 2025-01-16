const express=require("express");
const groupRouter=express.Router();
const Group=require("../models/GroupModel");
const {protect,isAdmin}=require("../middleware/authMiddleware");

// Create a new group

groupRouter.post("/",protect,isAdmin,async(req,res)=>{
    try {
        const {name,description}=req.body;
        const group=await Group.create({
            name,
            description,
            admin:req.user._id,
            members:[req.user._id],

        });
        const populatedGroup=await Group.findById(group._id).populate("admin","username email").populate("members","username email");
        res.status(201).json({populatedGroup});
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

// Get all groups
groupRouter.get("/",protect,async(req,res)=>{
    try {
        const groups=await Group.find().populate("admin","username email").populate("members","username email");

        res.status(200).json(groups);
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

// Join a group
groupRouter.post('/:groupId/join',protect,async(req,res)=>{
    try{
        const group=await Group.findById(req.params.groupId);
        console.log(group);
        if(!group){
            return res.status(404).json({message:"Group not found"});
        }
        if(group.members.includes(req.user._id)){
            return res.status(400).json({message:"Already a member of this group"});
        }
        group.members.push(req.user._id);
        await group.save();
        res.status(200).json({message:"Joined group successfully"});
    }catch(error){
        res.status(400).json({message:error.message});
    }
})

// Leave a group
groupRouter.post('/:groupId/leave',protect,async(req,res)=>{
    try{
        const group=await Group.findById(req.params.groupId);
        if(!group){
            return res.status(404).json({message:"Group not found"});
        }
        if(!group.members.includes(req.user._id)){
            return res.status(400).json({message:"Not a member of this group"});
        }
        group.members.pull(req.user._id);
        await group.save();
        res.status(200).json({message:"Left group successfully"});
    }catch(error){
        res.status(400).json({message:error.message});
    }
})


module.exports=groupRouter;