import { ACTIONS, SAGA_ACTIONS } from './actionTypes'
const INITIAL_STATE = {
    fromDate: "",
    toDate: "",
    appChoices: [],
    startYear: "",
    endYear: "",
    appVersions: [],
    brands: [],
    appVersionChoices: {},   // set in saga     
    initLoading: true,       // set in saga  
    yearChoices: [],         // set in saga
    appDropdownChoices: [],  // set in saga
    brandDropdownChoices: [] // set in saga
}

export const searchOptsReducer = (state = INITIAL_STATE, action) => {

    switch(action.type) {

        // NORMAL ACTIONS ------------------------------------------------------------------------
        case ACTIONS.SET_BRANDS: 
            return {
                ...state,
                brands: action.payload
            }
        case ACTIONS.SET_APP_VERSIONS:
            return {
                ...state,
                appVersions: action.payload
            }
        case ACTIONS.SET_FROM_DATE:
            return {
                ...state,
                fromDate: action.payload
            }
        case ACTIONS.SET_TO_DATE:
            return {
                ...state,
                toDate: action.payload
            }
        case ACTIONS.SET_APP_CHOICES:
            return {
                ...state,
                appChoices: action.payload,
                appVersions: state.appVersions.length ? state.appVersions.filter(v => {
                    let name = v.substring(v.indexOf('(') + 1, v.length - 1)
                    return action.payload.includes(name)
                }) : state.appVersions
            }
        case ACTIONS.SET_START_YEAR:
            return {
                ...state,
                startYear: action.payload
            }
        case ACTIONS.SET_END_YEAR:
            return {
                ...state,
                endYear: action.payload
            }


        // SAGA ACTIONS ------------------------------------------------------------------------
        case SAGA_ACTIONS.SET_APP_VERSION_CHOICES:
            return {
                ...state,
                appVersionChoices: action.payload
            }
        case SAGA_ACTIONS.SET_INIT_LOADING:
            return {
                ...state,
                initLoading: action.payload
            }
        case SAGA_ACTIONS.SET_YEAR_CHOICES:
            return {
                ...state,
                yearChoices: action.payload
            }
        case SAGA_ACTIONS.SET_AVAILABLE_APPS:
            return {
                ...state,
                appDropdownChoices: action.payload
            }
        case SAGA_ACTIONS.SET_BRAND_CHOICES:
            return {
                ...state,
                brandDropdownChoices: action.payload
            }
        default:
            return { ...state }
    }
}