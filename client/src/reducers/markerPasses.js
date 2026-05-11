const markerPassesReducer = (state = [], action) => {
  switch (action.type) {
    case 'SETMARKERPASSES':
      return Array.isArray(action.payload) ? [...action.payload] : []
    default:
      return state
  }
}

export default markerPassesReducer
