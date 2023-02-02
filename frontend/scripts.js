const submitPostToDB = async () => {
  const content = document.getElementById('content');

  if (!content.value) {
    alert('Post Must have valid text!');
    return;
  }

  try {
    const posts = await fetch(`http://localhost:8080/posts/${content.value}`, {
      method: 'post',
    });
    const data = await posts.json();
    console.log(data);
    content.value = '';

    alert('Successfully Posted');
  } catch (err) {
    alert('Error Posting 0_0');
    console.log(err);
  }
};

const deleteAllPosts = async () => {
  try {
    const posts = await fetch(`http://localhost:8080/delete`, {
      method: 'post',
    });
    const data = await posts.json();
    console.log(data);

    alert('Successfully Deleted All Posts');
  } catch (err) {
    alert('Error Deleting Posts 0_0');
  }
};

const getPostsFromDB = async () => {
  const posts = await fetch('http://localhost:8080/posts', {
    method: 'get',
  });
  let data = await posts.json();
  data = data.reverse();
  console.log(data);

  document.getElementById('postDisplay').innerHTML = formatPosts(data);
};

const formatPosts = (data) => {
  let html = '';

  for (row of data) {
    html += postDisplay(row);
  }

  return html;
};

const postDisplay = (row) => {
  const { postId, content, likes, dislikes, postDate } = row;
  formatTime(postDate);

  return `
  <div class="postWrapper">
    <div class="postContent">${content}</div>
    <div class="postInfoWrapper">
      <div>
        <button type="button" onclick="likePost(${postId})">↑</button> <span id="likes:${postId}">${likes}</span> Likes
      </div>
      <div>${formatTime(postDate)}</div>
    </div>
  </div>`;
};

const likePost = async (id) => {
  await fetch(`http://localhost:8080/post/like/${id}`, {
    method: 'post',
  });
  document.getElementById(`likes:${id}`).innerText = parseInt(document.getElementById(`likes:${id}`).innerText) + 1;
};

const formatTime = (timeString) => {
  return timeString.slice(11, 16);
};

getPostsFromDB();
