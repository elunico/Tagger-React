
import { useEffect, useState } from 'react';
import './SearchComponent.css';

function searchFilter(directoryList, query) {
  return Object.keys(directoryList)
    .filter(x => x.toLowerCase().includes(query) || directoryList[x].tags.some(y => y.toLowerCase().includes(query)));
}

function complexSearchFilter(directoryList, allConditions, anyConditions) {
  console.log(directoryList);
  let results = [];
  for (let item in directoryList) {
    let matches = true;
    for (let condition of allConditions) {
      if (!item.toLowerCase().includes(condition.toLowerCase()) &&
        !directoryList[item].tags.some(tag => tag.toLowerCase().includes(condition.toLowerCase()))) {
        matches = false;
      }
    }
    let oneTrue = false;
    for (let condition of anyConditions) {
      if (item.toLowerCase().includes(condition.toLowerCase()) ||
        directoryList[item].tags.some(tag => tag.toLowerCase().includes(condition.toLowerCase()))) {
        oneTrue = true;
      }
    }
    if (matches && (oneTrue || anyConditions.length === 0)) {
      results.push(item);
    }
  }
  return results;
}


function SearchComponent(props) {
  const { directory, directoryList, displayKeys, setDisplayKeys } = props;


  const [query, setQuery] = useState('');
  const [isSimple, setIsSimple] = useState(true);

  const [allConditions, setAllConditions] = useState([]);
  const [anyConditions, setAnyConditions] = useState([]);

  function addAndCondition() {
    let conditions = prompt("Enter the AND new condition (comma separated for multiple)", "").split(',').map(x => x.trim());
    setAllConditions([...allConditions, ...conditions]);
  }

  function addOrCondition() {
    let conditions = prompt("Enter the OR new condition (comma separated for multiple)", "").split(',').map(x => x.trim());
    setAnyConditions([...anyConditions, ...conditions]);
  }

  function doRecursiveSearch() {
    // eslint-disable-next-line no-restricted-globals
    let c = confirm('This will take a long time. Are you sure you want to do this? You will not see an update until it is complete');
    if (c) {
      fetch('/recursive-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          directory, allConditions, anyConditions
        })
      });
    }
  }
  useEffect(() => {
    if (isSimple) {
      setDisplayKeys(searchFilter(directoryList, query));
    }
  }, [query, isSimple]);

  useEffect(() => {
    if (!isSimple) {
      setDisplayKeys(complexSearchFilter(directoryList, allConditions, anyConditions));
    }
  }, [allConditions, anyConditions, isSimple]);


  let toggle = (
    <div className='toggle-container'>
      <label className="switch">Simple Search</label>
      <input type="checkbox" checked={isSimple} onChange={() => setIsSimple(!isSimple)} />
    </div>
  );

  if (isSimple) {
    return (
      <div className="search-container">
        {toggle}
        <input value={query} onChange={evt => setQuery(evt.target.value)} />
      </div>
    );
  } else {
    return (
      <div className="search-container">
        {toggle}
        <div className="search-container-header">
          <div className="search-container-header-and">
            <div className="and-column"> ALL of the following strings </div>
            {allConditions.map(condition => (
              <div className="and-column-item" key={`and-${condition}`}>
                <div className="and-column-condition" key={`$and-{condition}-item`}>{condition}</div>
                <button className="and-remove-button" onClick={() => setAllConditions(allConditions.filter(x => x !== condition))}>X</button>
              </div>
            ))}
            <button className="and-column" onClick={addAndCondition}>Add a AND condition</button>
          </div>
          <div className="search-container-header-or">
            <div className="or-column"> ANY of the following strings </div>
            {anyConditions.map(condition => (
              <div className="or-column-item" key={`or-${condition}`}>
                <div className="or-column-condition" key={`$or-{condition}-item`}>{condition}</div>
                <button className="or-remove-button" onClick={() => setAnyConditions(anyConditions.filter(x => x !== condition))}>X</button>
              </div>
            ))}
            <button className="or-column" onClick={addOrCondition}>Add a OR condition</button>
          </div>
        </div>
        <button className="search-clear-button" onClick={() => { setQuery(''); setAllConditions([]); setAnyConditions([]); }}>Clear Search</button>
        <p></p>
        <button className="search-recurse-button"

          onClick={doRecursiveSearch}>Recursive Search</button>



      </div>
    );
  }
}

export default SearchComponent;
