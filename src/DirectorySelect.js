import React from 'react';
import useState from 'react';

function DirectorySelect(props) {

  return (
    <div className="directory-select">
      <div className="directory-select-header">
        <h2>Select a directory</h2>
      </div>
      <div className="directory-select-body">
        <input value={props.directory} onChange={evt => props.setDirectory(evt.target.value)} />
        <button onClick={
          () => {
            let named = props.directory.replace(/\//g, '%2F');
            fetch(`/directory/${named}`)
              .then(resp => resp.json())
              .then(data => {
                console.log(data);
                if (data.status === 200) {
                  delete data.status;
                  props.setDirectoryList(data);
                } else {
                  props.setDirectoryList({});
                }
              }).catch(err => {
                console.log(err);
                props.setDirectoryList({ 'file': [] });
              });
          }
        }>Load Content</button>
      </div>
    </div>
  );
}


export default DirectorySelect;
