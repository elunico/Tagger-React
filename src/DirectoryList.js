import React, { useEffect, useState } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import './DirectoryList.css';

function getTags() {
  let tags = prompt("Enter the new tag. Comma separated for multiple tags.", '');
  return tags.split(',').map(x => x.trim());
}

function searchFilter(directoryList, query) {
  const intersections = query.split('&').map(x => x.trim().toLowerCase());
  const unions = query.split('|').map(x => x.trim().toLowerCase());
  return Object.keys(directoryList)
    // directory items that match the query in the filename
    .filter(x => unions.some(condition => x.toLowerCase().includes(condition)) || (intersections.every(condition => x.toLowerCase().includes(condition)) ||
      // directory items whose tags match the query
      (directoryList[x].filter(tag => unions.some(condition => tag.toLowerCase().includes(condition)) || intersections.every(condition => tag.toLowerCase().includes(condition))).length > 0)));
}

function subdirOf(directory, subitem) {
  let dir = directory.replace(/\//g, '%2F')
  if (!dir.endsWith('%2F')) {
    dir += '%2F';
  }
  return dir + subitem;
}

function DirectoryList(props) {

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (dirty) {
      let named = props.directory.replace(/\//g, '%2F');
      fetch(`/directory/${named}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(props.directoryList)
      });
      setDirty(false);
    }
  });

  const [dirty, setDirty] = useState(false);

  // TODO: persist on server?
  const removeTag = (item, tag) => {
    console.log(item, tag);
    let newList = props.directoryList[item].filter(x => x !== tag);
    props.setDirectoryList({ ...props.directoryList, [item]: newList });
    setDirty(true);
  };

  // TODO: persist on server?
  const addTag = (item, event) => {
    let newList = props.directoryList;
    for (let tag of getTags()) {
      if (tag) newList[item].push(tag);
    }
    console.log(newList);
    props.setDirectoryList(newList);
    setDirty(true);
  };


  let content;
  if (searchQuery) {
    content = searchFilter(props.directoryList, searchQuery).map(item => {
      return (
        <div className='directory-list-item' key={item}>
          <div className='filename-column' key={`${item}-file`}>{item}</div>
          <div className='tags-column' key={`${item}-tags`}>
            {props.directoryList[item].map(tag => (
              <button onClick={(event) => removeTag(item, tag)} key={`${item}-tag-${tag}`}>{tag}</button>
            ))}
          </div>
          <div>
            <button onClick={(event) => addTag(item, event)}>Add Tag</button>
          </div>
        </div>
      );
    });
  } else if (Object.keys(props.directoryList).length === 0) {
    content = (
      <div className="directory-list-body">
        <div className="directory-list-empty">
          <h3>Directory not found</h3>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="directory-list-body">
        {
          Object.keys(props.directoryList).map(item => (
            <div className='directory-list-item' key={item}>
              <div className='filename-column' key={`${item}-file`}>
                {item}
              </div>
              <div className='tags-column' key={`${item}-tags`}>
                {props.directoryList[item].map(tag => (
                  <button onClick={(event) => removeTag(item, tag)} key={`${item}-tag-${tag}`}>{tag}</button>
                ))}
              </div>
              <div>
                <button onClick={(event) => addTag(item, event)}>Add Tag</button>
              </div>
            </div>
          ))
        }
      </div>
    );
  }

  return (
    <div className="directory-list">
      <div className="directory-list-header">
        <h2>List of {props.directory} </h2>
        <div className="directory-list-search"> Search: &nbsp;
          <input value={searchQuery} onChange={evt => setSearchQuery(evt.target.value)} />
          <div className="directory-list-search-footer">
            You can search for tags separated by &amp; or |. Parentheses are not supported. &amp; has precedence over |.
          </div>
        </div>
      </div>
      {content}
    </div>
  );
}


export default DirectoryList;
