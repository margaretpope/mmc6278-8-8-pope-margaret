const { Post, Tag } = require('../models')

async function create(req, res, next) {
  const {title, body, tags} = req.body
  // TODO: create a new post
  // if there is no title or body, return a 400 status
  // omitting tags is OK
  // create a new post using title, body, and tags
  // return the new post as json and a 200 status
  if (!title || !body) return res.status(400) .send('entry must include title or body')
  const post = await Post.create({title, body, tags})
  res.status(200).json(post)
}

// should render HTML
async function get(req, res) {
  try {
    const slug = req.params.slug
    const post = await Post.findOne({slug}).lean().populate('tags')
    // TODO: Find a single post
    // find a single post by slug and populate 'tags'
    // you will need to use .lean() or .toObject()
    post.createdAt = new Date(post.createdAt).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
    post.comments.map(comment => {
      comment.createdAt = new Date(comment.createdAt).toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
      return comment
    })
    res.render('view-post', {post, isLoggedIn: req.session.isLoggedIn})
  } catch(err) {
    res.status(500).send(err.message)
  }
}

// should render HTML
async function getAll(req, res) {
  try {
    // get by single tag id if included
    const mongoQuery = {}
    if (req.query.tag) {
      const tagDoc =  await Tag.findOne({name: req.query.tag}).lean()
      if (tagDoc)
        mongoQuery.tags = {_id: tagDoc._id }
    }
    const postDocs = await Post
      .find(mongoQuery)
      .populate({
        path: 'tags'
      })
      .sort({createdAt: 'DESC'})
    const posts = postDocs.map(post => {
      post = post.toObject()
      post.createdAt = new Date(post.createdAt).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      return post
    })
    res.render('index', {
      posts,
      isLoggedIn: req.session.isLoggedIn,
      tag: req.query.tag
    })
  } catch(err) {
    res.status(500).send(err.message)
  }
}

async function update(req, res) {
  try {
    const {title, body, tags} = req.body
    const postId = req.params.id
    const post = await Post.findOneAndUpdate(
      {_id: postId},
      {$set: req.body},
      {new: true}
    )
    if (!title || !body) return res.status(400).send('title or body not found')
    res.status(200).json(post)
    // TODO: update a post
    // if there is no title or body, return a 400 status
    // omitting tags is OK
    // find and update the post with the title, body, and tags
    // return the updated post as json
  } catch(err) {
    res.status(500).send(err.message)
  }
}

async function remove(req, res, next) {
  try{
    const postId = req.params.id
    const post = await Post.findByIdAndDelete({_id: postId})
    res.status(200).send('post deleted')
  } catch {
    res.status(500).send('Error deleting post' + err.message)
  }
  // TODO: Delete a post
  // delete post by id, return a 200 status
}

module.exports = {
  get,
  getAll,
  create,
  update,
  remove
}
