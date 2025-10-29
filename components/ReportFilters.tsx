import React, { useMemo } from 'react';

export const StatusFilter = ({ column: { filterValue, setFilter, preFilteredRows, id } }) => {
  const options = useMemo(() => {
    const statuses = new Set();
    preFilteredRows.forEach(row => {
      statuses.add(row.values[id]);
    });
    return [...statuses.values()];
  }, [id, preFilteredRows]);

  return (
    <select
      value={filterValue || ''}
      onChange={e => setFilter(e.target.value || undefined)}
      className="p-1 border rounded"
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export const DepartmentFilter = ({ column: { filterValue, setFilter, preFilteredRows, id } }) => {
  const options = useMemo(() => {
    const departments = new Set();
    preFilteredRows.forEach(row => {
      departments.add(row.values[id]);
    });
    return [...departments.values()];
  }, [id, preFilteredRows]);

  return (
    <select
      value={filterValue || ''}
      onChange={e => setFilter(e.target.value || undefined)}
      className="p-1 border rounded"
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export const PriorityFilter = ({ column: { filterValue, setFilter } }) => {
  return (
    <select
      value={filterValue || ''}
      onChange={e => setFilter(e.target.value || undefined)}
      className="p-1 border rounded"
    >
      <option value="">All</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="critical">Critical</option>
    </select>
  );
};

export const DateRangeFilter = ({ column: { filterValue = [], setFilter } }) => {
  const [min, max] = filterValue;

  return (
    <div className="flex space-x-2">
      <input
        type="date"
        value={min || ''}
        onChange={e => {
          const val = e.target.value;
          setFilter((old = []) => [val ? val : undefined, old[1]]);
        }}
        className="p-1 border rounded w-full"
      />
      <input
        type="date"
        value={max || ''}
        onChange={e => {
          const val = e.target.value;
          setFilter((old = []) => [old[0], val ? val : undefined]);
        }}
        className="p-1 border rounded w-full"
      />
    </div>
  );
};