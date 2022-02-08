import React, { useEffect, useState } from 'react';
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
      (directoryList[x].tags.filter(tag => unions.some(condition => tag.toLowerCase().includes(condition)) || intersections.every(condition => tag.toLowerCase().includes(condition))).length > 0)));
}



function DirectoryList() {

  const [directoryInput, setDirectoryInput] = useState('');
  const [directory, setDirectory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryList, setDirectoryList] = useState({});
  const [dirty, setDirty] = useState(false);
  const [directoriesFirst, setDirectoriesFirst] = useState(false);

  function upDirectory() {
    let components = directory.split('/');
    components.pop();
    let newDirectory = components.join('/');
    setDirectory(newDirectory);
    setSearchQuery('');
  }

  useEffect(() => {
    let named = directory.replace(/\//g, '%2F');
    console.log('Dir to fetch' + named);
    if (directory) {
      fetch(`/directory/${named}`)
        .then(resp => resp.json())
        .then(data => {
          console.log(data);
          if (data.status === 200) {
            delete data.status;
            setDirectoryList(data);
          } else {
            setDirectoryList({});
          }
        }).catch(err => {
          console.log(err);
          setDirectoryList({});
        });
    }
  }, [directory]);

  useEffect(() => {
    if (dirty) {
      let named = directory.replace(/\//g, '%2F');
      fetch(`/directory/${named}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(directoryList)
      });
      setDirty(false);
    }
  });


  const removeTag = (item, tag) => {
    console.log(item, tag);
    let kind = directoryList[item].kind;
    let newList = directoryList[item].tags.filter(x => x !== tag);
    setDirectoryList({ ...directoryList, [item]: { kind: kind, tags: newList } });
    setDirty(true);
  };

  const addTag = (item, event) => {
    let newList = directoryList;
    for (let tag of getTags()) {
      if (tag) newList[item].tags.push(tag);
    }
    console.log(newList);
    setDirectoryList(newList);
    setDirty(true);
  };


  let content;
  if (searchQuery) {
    let search = searchFilter(directoryList, searchQuery);
    console.log(search);

    content = (
      <div className="directory-list-body">
        <div className="directory-list-title">
          <h3 className='filename-title'>Filename</h3>
          <h3 className='tags-title'>Tags (click to delete)</h3>
        </div>
        {search.map(item => (

          <div className='directory-list-item' key={item}>
            <div className='filename-column' key={`${item}-file`}>
              {
                (directoryList[item].kind === 'directory') ? (
                  <button onClick={() => {
                    setDirectory(`${directory}/${item}`);
                    setSearchQuery('');
                  }
                  }>Open</button>
                ) : (null)
              }

              <div className={`filename-column-item ${directoryList[item].kind === 'directory' ? 'directory' : ''}`}>{item}</div>

            </div>
            <div className='tags-column' key={`${item}-tags`}>
              {directoryList[item].tags.map(tag => (
                <button onClick={(event) => removeTag(item, tag)} key={`${item}-tag-${tag}`}>{tag}</button>
              ))}
            </div>
            <div>
              <button onClick={(event) => addTag(item, event)}>Add Tag</button>
            </div>
          </div>
        )
        )}
      </div>
    );
} else if (Object.keys(directoryList).length === 0) {
  content = (
    <div className="directory-list-body">

      <div className="directory-list-empty">
        <h3>Directory not found</h3>
      </div>
    </div>
  );
} else if (directoriesFirst) {
  let dirs = Object.keys(directoryList).filter(x => directoryList[x].kind === 'directory');
  let files = Object.keys(directoryList).filter(x => directoryList[x].kind === 'file');
  let itemKeys = dirs.concat(files);
  content = (
    <div className="directory-list-body">
      <div className="directory-list-title">
        <h3 className='filename-title'>Filename</h3>
        <h3 className='tags-title'>Tags (click to delete)</h3>
      </div>
      {

        itemKeys.map(item => (
          <div className='directory-list-item' key={item}>
            <div className='filename-column' key={`${item}-file`}>
              {
                (directoryList[item].kind === 'directory') ? (
                  <button onClick={() => {
                    setDirectory(`${directory}/${item}`);
                    setSearchQuery('');
                    // reloadData(`${directory}/${item}`);
                  }
                  }>Open</button>
                ) : (null)
              }

              <div className={`filename-column-item ${directoryList[item].kind === 'directory' ? 'directory' : ''}`}>{item}</div>

            </div>
            <div className='tags-column' key={`${item}-tags`}>
              {directoryList[item].tags.map(tag => (
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
} else {
  content = (
    <div className="directory-list-body">
      <div className="directory-list-title">
        <h3 className='filename-title'>Filename</h3>
        <h3 className='tags-title'>Tags (click to delete)</h3>
      </div>
      {
        Object.keys(directoryList).map(item => (
          <div className='directory-list-item' key={item}>
            <div className='filename-column' key={`${item}-file`}>
              {
                (directoryList[item].kind === 'directory') ? (
                  <button onClick={() => {
                    setDirectory(`${directory}/${item}`);
                    // reloadData(`${directory}/${item}`);
                  }
                  }>Open</button>
                ) : (null)
              }

              <div className={`filename-column-item ${directoryList[item].kind === 'directory' ? 'directory' : ''}`}>{item}</div>

            </div>
            <div className='tags-column' key={`${item}-tags`}>
              {directoryList[item].tags.map(tag => (
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
    <div className="directory-select">
      <div className="directory-select-header">
        <h2>Select a directory</h2>
      </div>
      <div className="directory-select-body">
      <input value={directoryInput} onChange={evt => setDirectoryInput(evt.target.value)} />
      <button onClick={() => setDirectory(directoryInput)}>Load Content</button>

      </div>
    </div>
    <div className="directory-list-header">
      <h2>List of {directory} </h2>

      <div className="directory-controls">
        <button onClick={upDirectory}>Up Directory</button>
        <br />
        <input type="checkbox" checked={directoriesFirst} onChange={evt => setDirectoriesFirst(evt.target.checked)} />
        <label htmlFor="directoriesFirst">List Directories First in Table</label>

        <div className="directory-list-search"> Search: &nbsp;
        <input value={searchQuery} onChange={evt => setSearchQuery(evt.target.value)} />
        <div className="directory-list-search-footer">
          You can search for tags separated by &amp; or |. Parentheses are not supported. &amp; has precedence over |.
        </div>
      </div>
      </div>
    </div>
    {content}
  </div>
);
}


export default DirectoryList;
