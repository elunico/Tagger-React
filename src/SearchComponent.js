
import { useEffect, useState } from 'react';
import './SearchComponent.css';

function searchFilter(directoryList, query) {
  return Object.keys(directoryList)
    .filter(x => x.toLowerCase().includes(query) || directoryList[x].tags.some(y => y.toLowerCase().includes(query)));
}

function complexSearchFilter(directoryList, allConditions, anyConditions, avoidConditions) {
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
    let hasAvoid = false;
    for (let condition of avoidConditions) {
      if (item.toLowerCase().includes(condition.toLowerCase()) ||
        directoryList[item].tags.some(tag => tag.toLowerCase().includes(condition.toLowerCase()))) {
        hasAvoid = true;
      }
    }
    if (matches && (oneTrue || anyConditions.length === 0) && !hasAvoid) {
      results.push(item);
    }
  }
  return results;
}


function SearchComponent(props) {
  const { isEditableTags, setIsEditableTags, directory, setDirectory, directoryList, setDirectoryList, displayKeys, setDisplayKeys } = props;


  const [query, setQuery] = useState('');
  const [isSimple, setIsSimple] = useState(true);

  const [allConditions, setAllConditions] = useState([]);
  const [anyConditions, setAnyConditions] = useState([]);
  const [avoidConditions, setAvoidConditions] = useState([]);

  const [pendingRecursiveSearch, setPendingRecursiveSearch] = useState(false);

  const [oldData, setOldData] = useState(directoryList);

  function clearSearch() {
    setQuery('');
    setAllConditions([]);
    setAnyConditions([]);
    setAvoidConditions([]);
    setIsEditableTags(true);
    setDisplayKeys([]);
    setDirectoryList(oldData);
  }

  function addAndCondition() {
    let conditions = prompt("Enter the AND new condition (comma separated for multiple)", "")
    if (conditions) {
      conditions = conditions.split(',').map(x => x.trim().toLowerCase());
      setAllConditions([...allConditions, ...conditions]);
    }
  }

  function addOrCondition() {
    let conditions = prompt("Enter the OR new condition (comma separated for multiple)", "")
    if (conditions) {
      conditions = conditions.split(',').map(x => x.trim().toLowerCase());
      setAnyConditions([...anyConditions, ...conditions]);
    }
  }

  function addAvoidCondition() {
    let conditions = prompt("Enter the AVOID new condition (comma separated for multiple)", "")
    if (conditions) {
      conditions = conditions.split(',').map(x => x.trim().toLowerCase());
      setAvoidConditions([...avoidConditions, ...conditions]);
    }
  }

  function doRecursiveSearch() {
    // eslint-disable-next-line no-restricted-globals
    let c = confirm('This will take a long time. Are you sure you want to do this? You will not see an update until it is complete');
    if (c) {
      setPendingRecursiveSearch(true);
      setDisplayKeys([]);
      fetch('/recursive-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          directory, allConditions, anyConditions, avoidConditions
        })
      }).then(res => res.json())
        .then(data => {
          console.log(data);
          // TODO: hold old data for when search clears
          setOldData(directoryList);
          setDirectoryList(data.results);
          setPendingRecursiveSearch(false);
          setIsEditableTags(false);
        }).catch(err => {
          console.log(err);
          setPendingRecursiveSearch(false);
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
      setDisplayKeys(complexSearchFilter(directoryList, allConditions, anyConditions, avoidConditions));
    }
  }, [allConditions, anyConditions, avoidConditions, isSimple]);


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
        <input value={query} onChange={evt => setQuery(evt.target.value.toLowerCase())} />
      </div>
    );
  } else if (pendingRecursiveSearch) {
    return (
      <div className="search-container">
        <div className="searching-pending">Searching...</div>
      </div>
    );
  }
  else {
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
          <div className="search-container-header-avoid">
            <div className="avoid-column"> AVOID the following strings <br/>(files/dirs containing this will be skipped) </div>
            {avoidConditions.map(condition => (
              <div className="avoid-column-item" key={`avoid-${condition}`}>
                <div className="avoid-column-condition" key={`$avoid-{condition}-item`}>{condition}</div>
                <button className="avoid-remove-button" onClick={() => setAvoidConditions(avoidConditions.filter(x => x !== condition))}>X</button>
              </div>
            ))}
            <button className="avoid-column" onClick={addAvoidCondition}>Add a AVOID condition</button>
          </div>
        </div>
        { !isEditableTags && <div className='search-container-item footer'>Clear search to enable editing tags</div>}
        <button className="search-clear-button" onClick={() => { clearSearch(); }}>Clear Search</button>
        <p></p>
        <button className="search-recurse-button"

          onClick={(e) => { doRecursiveSearch(); }}>Recursive Search</button>



      </div>
    );
  }
}

export default SearchComponent;
