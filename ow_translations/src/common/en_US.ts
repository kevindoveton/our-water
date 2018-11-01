/**
 * Do not edit this file directly. 
 * Instead, edit the appropriate spreadsheet 
 * https://docs.google.com/spreadsheets/d/102zLqEWj4xlqqNgVUFCiMLqdcvaLY6GntS1xmlHdAE8/edit#gid=0
 * and recompile in order to change these fields
 */

import { TranslationFile } from "../Types";

const en_US: TranslationFile = {
  metadata: {
    language: 'english',
    region: 'united states',
  },
  templates: {
    app_resource_load_error: "Error loading reading locations. Please try again.",
    app_resource_not_found: "Could not find the selected reading location",
    settings_connect_to_pending_title: "OVERRIDE",
    settings_connect_to_connected_title: "OVERRIDE",
    settings_connect_to_subtitle_error: "OVERRIDE",
    settings_login_error: "Error logging in.",
    settings_sync_heading: "MyWell Sync",
    settings_new_resource: "New reading Location",
    search_heading: "Search",
    search_error: "Couldn't perform search. Please try again.",
    search_more: "More...",
    search_no_results: "No Results Found",
    search_hint: "Search By Id",
    search_recent_searches: "Recent Searches",
    search_offline_line_1: "You are currently offline.",
    search_offline_line_2: "Showing limited search results.",
    new_reading_invalid_error_heading: "Error",
    new_reading_invalid_error_description: "Invalid reading. Please check and try again.",
    new_reading_invalid_error_ok: "OK",
    new_reading_unknown_error_heading: "Error",
    new_reading_unknown_error_description: "There was a problem saving your reading. Please try again.",
    new_reading_unknown_error_ok: "OK",
    new_reading_saved_popup_title: "",
    new_reading_saved: "Reading Saved",
    new_reading_warning_login_required: "Reading saved locally only. Login with MyWell to save in cloud.",
    new_reading_dialog_one_more: "One More",
    new_reading_dialog_done: "Done",
    new_reading_date_field: "Reading Date",
    new_reading_date_field_invalid: "Invalid Date",
    new_reading_value_field: (units: string) => `Measurement in ${units}`,
    new_reading_value_field_invalid: "Invalid Measurement",
    new_reading_timeseries: "N/A",
    new_reading_save_button: "Save",
    connect_to_service_username_field: "N/A",
    connect_to_service_username_invalid: "N/A",
    connect_to_service_password_field: "N/A",
    connect_to_service_password_invalid: "N/A",
    connect_to_service_mobile_field: "Phone number",
    connect_to_service_mobile_invalid: "Phone number is required",
    connect_to_service_verify_field: "Enter the 4 digit code we sent you.",
    connect_to_service_verify_invalid: "You entered the wrong code. Please try again.",
    connect_to_service_logout_button: "Log Out",
    connect_to_service_submit_button: "",
    connect_to_service_description: "",
    connect_to_service_connected_test: (fieldName: string, username: string) => `You are connected to MyWell with the ${fieldName}: ${username}`,
    connect_to_service_error: "Error signing in. Please try again",
    connect_to_service_org_selector: "N/A",
    favourite_resource_heading: "Favorites",
    favourite_resource_hint_1: "Press the",
    favourite_resource_hint_2: "button to add a favourite",
    recent_resource_heading: "Recents",
    recent_resource_none: "No recent locations",
    resource_detail_latest: "Latest readings",
    resource_detail_new: "New Reading",
    sync_login_message: "Login to sync with MyWell",
    sync_start_sync_button: "Start Sync",
    sync_start_sync_button_loading: "Syncing with MyWell",
    sync_section_resources: "Reading Locations",
    sync_section_readings: "Readings",
    sync_empty_heading: "Nothing to sync!",
    sync_empty_content: "Start taking readings or creating groundwater stations to get started.",
    select_language_heading: "",
    resource_detail_summary_tab: "",
    resource_detail_empty_heading: "",
    resource_detail_empty_hint: "",
    new_resource_saved_dialog: "",
    new_resource_saved_dialog_warning: "",
    resource_name: "",
    new_resource_lat: "",
    new_resource_lng: "",
    new_resource_asset_type_label: "",
    new_resource_owner_name_label: "",
    new_resource_submit_button: "",
  }
}

export {en_US};
