 import React, { useEffect, useLayoutEffect, useState } from 'react';
import './DirectoryList.css';
import SearchComponent from './SearchComponent';

function getTags() {
  let tags = prompt("Enter the new tag. Comma separated for multiple tags.", '');
  return tags.split(',').map(x => x.trim());
}



function DirectoryList() {

  const [directoryInput, setDirectoryInput] = useState('');
  const [directory, setDirectory] = useState('');
  const [directoryList, setDirectoryList] = useState({});
  const [dirty, setDirty] = useState(false);
  const [directoriesFirst, setDirectoriesFirst] = useState(false);
  const [displayKeys, setDisplayKeys] = useState([]);
  const [isEditableTags, setIsEditableTags] = useState(true);

  function upDirectory() {
    let components = directory.split('/');
    components.pop();
    let newDirectory = components.join('/');
    setDirectory(newDirectory);
  }

  useEffect(() => {
    let named = directory.replace(/\//g, '%2F');
    console.log('Dir to fetch' + named);
    if (directory) {
      setDisplayKeys([]);
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

  useEffect(() => {
    if (Object.keys(directoryList).length === 0) {
      setDisplayKeys([]);
    } else if (directoriesFirst) {
      let dirs = Object.keys(directoryList).filter(x => directoryList[x].kind === 'directory');
      let files = Object.keys(directoryList).filter(x => directoryList[x].kind === 'file');
      let itemKeys = dirs.concat(files);
      setDisplayKeys(itemKeys);
    } else {
      setDisplayKeys(Object.keys(directoryList));
    }
  }, [directoryList, directoriesFirst]);


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

          <h3 className="directory-list-search"> Search: &nbsp;
          </h3>
          <SearchComponent
            isEditableTags={isEditableTags}
            setIsEditableTags={setIsEditableTags}
            directory={directory}
            setDirectory={setDirectory}
            directoryList={directoryList}
            setDirectoryList={setDirectoryList}
            displayKeys={displayKeys}
            setDisplayKeys={setDisplayKeys} />
        </div>
      </div>
      <div className="directory-list-body">
        <div className="directory-list-title">
          <h3 className='filename-title'>Filename</h3>
          <h3 className='tags-title'>Tags (click to delete)</h3>
        </div>
        {
          displayKeys.map(item => (
            <div className='directory-list-item' key={item}>
              <div className='filename-column' key={`${item}-file`}>
                {
                  (directoryList[item].kind === 'directory') ? (
                    <button onClick={() => {
                      setDirectory(`${directory}/${item}`);
                    }
                    }>Open</button>
                  ) : (null)
                }

                <div className={`filename-column-item ${directoryList[item].kind === 'directory' ? 'directory' : ''}`}>{item}</div>

              </div>
              <div className='tags-column' key={`${item}-tags`}>
                {directoryList[item].tags.map(tag => (
                  isEditableTags && <button onClick={(event) => removeTag(item, tag)} key={`${item}-tag-${tag}`}>{tag}</button>
                ))}
              </div>
              <div>
                {isEditableTags && <button onClick={(event) => addTag(item, event)}>Add Tag</button>}
              </div>
            </div>
          ))
        }

      </div>
    </div>
  );
}


export default DirectoryList;
