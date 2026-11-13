/*@v:8c0d81398d*/
// ⚡ moduły ładowane na żądanie (wersja 8c0d81398d) — funkcja z modułu ma w rdzeniu „zastępcę”, który doładowuje moduł i ją wywołuje
var __LZV='8c0d81398d',__LZN=12,__lzP={};
function __lzBase(){return location.protocol==='file:'?'':'/'}
function __lzLoad(c){if(__lzP[c])return __lzP[c];return __lzP[c]=new Promise(function(ok,no){var s=document.createElement('script');s.src=__lzBase()+'js/m'+c+'.js?v='+__LZV;s.onload=function(){ok()};s.onerror=function(){delete __lzP[c];no(new Error('module m'+c))};document.head.appendChild(s)})}
function __lz(c,name,self,args){var stub=window[name],t=setTimeout(function(){try{showToast('⏳ …','info')}catch(e){}},700);return __lzLoad(c).then(function(){clearTimeout(t);var f=window[name];if(!f||f===stub)throw new Error('lazy '+name);return f.apply(self,args)}).catch(function(e){clearTimeout(t);console.error(e);try{showToast(location.hostname.indexOf('eu.')===0?'⚠ Could not load part of the page — please refresh':'⚠ Nie udało się wczytać części strony — odśwież stronę','error')}catch(_){}})}
(function(){function pre(){var i=1;(function next(){if(i>__LZN)return;__lzLoad(i++).then(function(){(window.requestIdleCallback||setTimeout)(next,{timeout:1500})},next)})()}
  if(document.readyState==='complete')setTimeout(pre,1200);else window.addEventListener('load',function(){setTimeout(pre,1200)})})();


// ═══════════════════════════════════════════════════════════════
// I18N — LANGUAGE SYSTEM
// ═══════════════════════════════════════════════════════════════
// 🇪🇺 tryb ligi EU: strona pod adresem eu.… (albo ?league=eu do testów) — osobny Worker i dane, tylko angielski
const EU_MODE = /^eu\./i.test(location.hostname) || new URLSearchParams(location.search).get('league') === 'eu';
const EU_SITE = 'https://eu.chemikleagues.com', MAIN_SITE = 'https://chemikleagues.com';
const EU_WORKER = 'https://eu-proxy.igor-bernakiewicz.workers.dev'; // ← adres Workera ligi EU (po utworzeniu)
let currentLang = EU_MODE ? 'en' : (localStorage.getItem('nba2k_lang') || 'pl');

const TRANSLATIONS = {
  pl: {
    // Nav
    nav_dashboard: 'Dashboard', nav_matches: 'Mecze', nav_stats: 'Statystyki',
    nav_add_match: '+ Dodaj Mecz', nav_schedule: '📅 Harmonogram', nav_aliases: '⚙ Aliasy',
    // Dashboard
    league_summary: 'Podsumowanie Ligi', best_five: '🏅 Najlepsza Piątka Kolejki',
    team_form: '📈 Forma Drużyn', top3: '⭐ Top 3 Zawodnicy', standings: 'Tabela',
    see_top10: 'Zobacz Top 10 →', see_more: 'Zobacz więcej →',
    // Matches
    match_results: 'Wyniki Meczów', all_seasons: 'Wszystkie sezony',
    all_teams: 'Wszystkie drużyny', all_players: 'Wszyscy zawodnicy',
    add_match: 'Dodaj Mecz', add_match_btn: '+ Dodaj Mecz',
    // Stats
    player_stats: 'Statystyki Zawodników', compare: '⚡ Porównaj',
    season_lbl: 'Sezon', team_lbl: 'Drużyna', position_lbl: 'Pozycja', all_pos: 'Wszystkie',
    // Table headers
    th_player: 'Zawodnik', th_team: 'Drużyna', th_gp: 'GP', th_grd: 'GRD',
    th_pts: 'PTS', th_reb: 'REB', th_ast: 'AST', th_stl: 'STL', th_blk: 'BLK',
    th_to: 'TO', th_fg: 'FG%', th_3p: '3P%', th_ft: 'FT%',
    // Schedule
    schedule_title: '📅 Harmonogram', no_schedule: 'Brak zaplanowanych meczów',
    // Aliases
    aliases_title: 'Aliasy', apply_aliases: 'Zastosuj aliasy',
    // Misc
    logout: '🔓 Wyloguj', settings: '⚙ Baza', seasons_btn: '🏆 Sezony',
    loading: 'Ładowanie...', save: 'Zapisz', cancel: 'Anuluj', delete: 'Usuń',
    edit: 'Edytuj', close: 'Zamknij', yes: 'Tak', no: 'Nie',
    games: 'meczów', game: 'mecz', week: 'Tydzień',
    win: 'W', loss: 'P', draw: 'R',
    career_records: '🏆 Rekordy kariery',
    match_history: 'Historia meczów',
    hot_streak: '🔥 HOT STREAK — A- lub lepsza w ostatnich 3 meczach!',
    player_card: '🃏 Karta',
    round_label: 'Kolejka',
    composite_higher: 'wyżej = lepiej', per_higher: 'wyżej = lepiej',
    save_match: 'Zapisz Mecz',
    add_player: '+ Dodaj Zawodnika',
    screenshot: 'Wgraj Screenshot',
    check_save: 'Sprawdź i Zapisz',
    no_matches: 'Brak meczów',
    no_data: 'Brak danych',
    add_matches_for_leaders: 'Liderzy ligi pojawią się po pierwszych meczach',
    rivals: '⚔️ Rywalizacja',
    next_matches: 'Najbliższe mecze',
    top_scorers: 'Top Strzelcy',
    last_results: 'Ostatnie wyniki',
    nav_events: '🏆 Drafty',
    round_lbl: 'Kolejka',
    err_data_too_large: '❌ Dane za duże — limit JSONBin to ~100KB',
    err_names_diff: '❌ Nazwy muszą być różne',
    teams_updated: '✅ Zaktualizowano drużyny!',
    err_enter_team: '❌ Wpisz nazwę drużyny',
    logo_deleted: '🗑 Logo usunięte',
    err_pick_two_teams: '❌ Wybierz dwie różne drużyny',
    err_pick_date2: '❌ Podaj datę',
    deleted_lbl: '🗑 Usunięto',
    no_matches_to_merge: 'Brak meczów do połączenia',
    win_streak: 'W z rzędu',
    loss_streak: 'L z rzędu',
    stat_pts: 'Punkty (śr.)',
    stat_reb: 'Zbiórki (śr.)',
    stat_ast: 'Asysty (śr.)',
    stat_stl: 'Przechwyty (śr.)',
    stat_blk: 'Bloki (śr.)',
    stat_to: 'Straty (śr.)',
    hot_streak_has: 'ma',
    hot_streak_last3: 'ocenę A- lub lepszą w ostatnich 3 meczach',
    err_save_status: '❌ Błąd zapisu: ',
    err_json_file: '❌ Błąd pliku JSON: ',
    err_enter_teams: '❌ Wpisz obie drużyny',
    err_teams_diff: '❌ Drużyny muszą być różne',
    err_pick_date: '❌ Wybierz datę',
    err_fill_all: '❌ Wypełnij wszystkie pola',
    err_date_order: '❌ Data od musi być wcześniej niż do',
    err_fill_both: '❌ Wypełnij oba pola',
    round_deleted: '🗑 Kolejka usunięta',
    match_saved_recap: '🎉 Mecz zapisany! Generuję recap...',
    match_saved_simple: '🎉 Mecz zapisany! Możesz zobaczyć go w zakładce Mecze.',
    api_empty_response: 'Pusta odpowiedź API. Sprawdź konsolę.',
    api_parsing: '📄 Odpowiedź AI otrzymana, parsowanie JSON...',
    api_no_json: 'Brak JSON. Odpowiedź AI: ',
    match_saved: '✅ Mecz zapisany! Możesz zobaczyć go w zakładce Mecze.',
    match_deleted: '🗑 Mecz usunięty',
    team_added: '✅ Drużyna dodana:',
    season_created: 'utworzony i aktywowany',
    season_reassign: 'zostaną przepisane',
    no_alias: 'Brak aliasów drużyn',
    no_teams: 'Brak drużyn',
    min_games_for_h2h: 'Minimum 2 mecze do statystyk H2H',
    no_matches_round: 'Brak meczów w tej kolejce',
    click_player_profile: 'Kliknij zawodnika aby zobaczyc profil',
    no_matches_selected: 'Nie zaznaczono żadnych meczów',
    err_no_master_key: '❌ Brak Master Key — zaloguj się jako admin aby zapisywać dane',
    err_no_master_key_import: '❌ Brak Master Key — zaloguj się jako admin aby zapisać import!',
    err_load: '❌ Błąd ładowania danych: ',
    err_save: '❌ Błąd zapisu: ',
    err_connect: '❌ Błąd połączenia: ',
    err_no_api: '❌ Brak konfiguracji AI — podaj Worker URL w ⚙ Baza',
    uploading_file: '✓ Plik wgrany — kliknij "Analizuj Screenshot" aby odczytać statystyki.',
    ai_analyzing: '🤖 AI analizuje screenshot, proszę czekać...',
    ai_spinner: '<div class="spinner"></div> Analizuję...',
    saving_db: '⏳ Zapisuję do bazy...',
    merged_ok: '✅ Połączono!',
    generating_prediction: '⏳ Generuję predykcję AI...',
    generating_recap: '⏳ Generuję recap...',
    save_ok: '✅ Zapisz',
    delete_btn: '✕ Usuń',
    merging: '⏳ Łączenie...',
    no_pos_data: 'Za mało danych (zawodnicy muszą mieć przypisane pozycje)',
    first_five_lbl: '1. Piątka',
    second_five_lbl: '2. Piątka',
    def_five_lbl: 'Defensywna Piątka',
    th_pos: 'Poz',
    games_count: 'meczów',
    hot_streak_players: 'zawodnik',
    hot_streak_suffix: 'ocenę A- lub lepszą w ostatnich',
    no_shots: 'brak rzutów',
    imported_ok: 'Zaimportowano i zapisano',
    matches_suffix: 'meczów!',
    rc_title: '🏗️ KALKULATOR SKŁADU',
    rc_subtitle: 'Wybierz 5 graczy i sprawdź siłę składu',
    rc_pick: 'wybierz',
    rc_players: 'gr.',
    rc_rating_lbl: 'Ocena składu',
    rc_effective_cs: 'Effective CS',
    rc_avg_cs: 'AVG CS',
    rc_potential: '⚡ POTENCJAŁ ZESPOŁU (sumaryczne per game)',
    rc_scale: '📋 SKALA OCEN',
    rc_weak_link: '⚠️ słabe ogniwo',
    rc_pts: '📊 Śr. punkty', rc_pts_sub: 'sumaryczne PPG',
    rc_def: '🛡️ Śr. tracone', rc_def_sub: 'na podstawie meczów drużyn',
    rc_reb: '🏀 Zbiórki', rc_reb_sub: 'łącznie RPG',
    rc_ast: '🎯 Asysty', rc_ast_sub: 'łącznie APG',
    rc_stl: '🦅 Przech.', rc_stl_sub: 'łącznie SPG',
    rc_blk: '🛡️ Bloki', rc_blk_sub: 'łącznie BPG',
    rc_to: '💔 Straty', rc_to_sub: 'łącznie TOPG',
    rc_fg: '🎳 FG%', rc_fg_sub: 'z pola łącznie',
    rc_3p: '🏹 3P%', rc_3p_sub: 'za 3 łącznie',
    rc_god: 'GOD TIER 👑', rc_god_desc: 'Dominujący skład, żaden slot nie jest słaby',
    rc_elite: 'ELITE ⭐', rc_elite_desc: 'Bardzo silny skład, zdolny wygrać każdy mecz',
    rc_strong: 'STRONG 💪', rc_strong_desc: 'Solidna piątka z wyraźnymi atutami',
    rc_solid: 'SOLID 👍', rc_solid_desc: 'Kompetentny skład bez wyraźnych dziur',
    rc_average: 'AVERAGE 😐', rc_average_desc: 'Przeciętny skład, jest pole do poprawy',
    rc_weak: 'WEAK 📉', rc_weak_desc: 'Skład potrzebuje wzmocnienia na kilku pozycjach',
    rc_rebuilding: 'REBUILDING 🔨', rc_rebuilding_desc: 'Projekt na przyszłość — brakuje doświadczenia',
  },
  en: {
    nav_dashboard: 'Dashboard', nav_matches: 'Matches', nav_stats: 'Statistics',
    nav_add_match: '+ Add Match', nav_schedule: '📅 Schedule', nav_aliases: '⚙ Settings',
    league_summary: 'League Summary', best_five: '🏅 Best Five of the Round',
    team_form: '📈 Team Form', top3: '⭐ Top 3 Players', standings: 'Standings',
    see_top10: 'See Top 10 →', see_more: 'See more →',
    match_results: 'Match Results', all_seasons: 'All seasons',
    all_teams: 'All teams', all_players: 'All players',
    add_match: 'Add Match', add_match_btn: '+ Add Match',
    player_stats: 'Player Statistics', compare: '⚡ Compare',
    season_lbl: 'Season', team_lbl: 'Team', position_lbl: 'Position', all_pos: 'All',
    th_player: 'Player', th_team: 'Team', th_gp: 'GP', th_grd: 'GRD',
    th_pts: 'PTS', th_reb: 'REB', th_ast: 'AST', th_stl: 'STL', th_blk: 'BLK',
    th_to: 'TO', th_fg: 'FG%', th_3p: '3P%', th_ft: 'FT%',
    schedule_title: '📅 Schedule', no_schedule: 'No scheduled matches',
    aliases_title: 'Aliases', apply_aliases: 'Apply aliases',
    logout: '🔓 Logout', settings: '⚙ Settings', seasons_btn: '🏆 Seasons',
    loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete',
    edit: 'Edit', close: 'Close', yes: 'Yes', no: 'No',
    games: 'games', game: 'game', week: 'Week',
    win: 'W', loss: 'L', draw: 'D',
    career_records: '🏆 Career Records',
    match_history: 'Match History',
    hot_streak: '🔥 HOT STREAK — A- or better in last 3 games!',
    player_card: '🃏 Card',
    round_label: 'Round',
    composite_higher: 'higher = better', per_higher: 'higher = better',
    save_match: 'Save Match',
    add_player: '+ Add Player',
    screenshot: 'Upload Screenshot',
    check_save: 'Review & Save',
    no_matches: 'No matches',
    no_data: 'No data',
    add_matches_for_leaders: 'League leaders will appear after the first games',
    rivals: '⚔️ Rivalry',
    next_matches: 'Upcoming matches',
    top_scorers: 'Top Scorers',
    last_results: 'Recent results',
    nav_events: '🏆 Drafts',
    round_lbl: 'Round',
    err_data_too_large: '❌ Data too large — JSONBin limit is ~100KB',
    err_names_diff: '❌ Names must be different',
    teams_updated: '✅ Teams updated!',
    err_enter_team: '❌ Enter team name',
    logo_deleted: '🗑 Logo deleted',
    err_pick_two_teams: '❌ Pick two different teams',
    err_pick_date2: '❌ Pick a date',
    deleted_lbl: '🗑 Deleted',
    no_matches_to_merge: 'No matches to merge',
    win_streak: 'W streak',
    loss_streak: 'L streak',
    stat_pts: 'Points (avg.)',
    stat_reb: 'Rebounds (avg.)',
    stat_ast: 'Assists (avg.)',
    stat_stl: 'Steals (avg.)',
    stat_blk: 'Blocks (avg.)',
    stat_to: 'Turnovers (avg.)',
    hot_streak_has: 'has',
    hot_streak_last3: 'grade A- or better in last 3 games',
    err_save_status: '❌ Save error: ',
    err_json_file: '❌ JSON file error: ',
    err_enter_teams: '❌ Enter both teams',
    err_teams_diff: '❌ Teams must be different',
    err_pick_date: '❌ Pick a date',
    err_fill_all: '❌ Fill in all fields',
    err_date_order: '❌ Start date must be before end date',
    err_fill_both: '❌ Fill in both fields',
    round_deleted: '🗑 Round deleted',
    match_saved_recap: '🎉 Match saved! Generating recap...',
    match_saved_simple: '🎉 Match saved! You can see it in the Matches tab.',
    api_empty_response: 'Empty API response. Check console.',
    api_parsing: '📄 AI response received, parsing JSON...',
    api_no_json: 'No JSON. AI response: ',
    match_saved: '✅ Match saved! You can see it in the Matches tab.',
    match_deleted: '🗑 Match deleted',
    team_added: '✅ Team added:',
    season_created: 'created and activated',
    season_reassign: 'will be reassigned',
    no_alias: 'No team aliases',
    no_teams: 'No teams',
    min_games_for_h2h: 'Minimum 2 games for H2H stats',
    no_matches_round: 'No matches in this round',
    click_player_profile: 'Click a player to see their profile',
    no_matches_selected: 'No matches selected',
    err_no_master_key: '❌ No Master Key — log in as admin to save data',
    err_no_master_key_import: '❌ No Master Key — log in as admin to save import!',
    err_load: '❌ Load error: ',
    err_save: '❌ Save error: ',
    err_connect: '❌ Connection error: ',
    err_no_api: '❌ No AI configured — enter Worker URL in ⚙ Settings',
    uploading_file: '✓ File uploaded — click "Analyze Screenshot" to read stats.',
    ai_analyzing: '🤖 AI is analyzing the screenshot, please wait...',
    ai_spinner: '<div class="spinner"></div> Analyzing...',
    saving_db: '⏳ Saving to database...',
    merged_ok: '✅ Merged!',
    generating_prediction: '⏳ Generating AI prediction...',
    generating_recap: '⏳ Generating recap...',
    save_ok: '✅ Save',
    delete_btn: '✕ Delete',
    merging: '⏳ Merging...',
    no_pos_data: 'Not enough data (players need assigned positions)',
    first_five_lbl: 'First Five',
    second_five_lbl: 'Second Five',
    def_five_lbl: 'Defensive Five',
    th_pos: 'Pos',
    games_count: 'games',
    hot_streak_players: 'player',
    hot_streak_suffix: 'with A- or better in last',
    no_shots: 'no shots',
    imported_ok: 'Imported and saved',
    matches_suffix: 'matches!',
    rc_title: '🏗️ ROSTER CALCULATOR',
    rc_subtitle: 'Pick 5 players and evaluate your roster strength',
    rc_pick: 'pick',
    rc_players: 'pl.',
    rc_rating_lbl: 'Roster rating',
    rc_effective_cs: 'Effective CS',
    rc_avg_cs: 'AVG CS',
    rc_potential: '⚡ TEAM POTENTIAL (combined per game)',
    rc_scale: '📋 RATING SCALE',
    rc_weak_link: '⚠️ weak link',
    rc_pts: '📊 Avg points', rc_pts_sub: 'combined PPG',
    rc_def: '🛡️ Avg conceded', rc_def_sub: 'based on team history',
    rc_reb: '🏀 Rebounds', rc_reb_sub: 'combined RPG',
    rc_ast: '🎯 Assists', rc_ast_sub: 'combined APG',
    rc_stl: '🦅 Steals', rc_stl_sub: 'combined SPG',
    rc_blk: '🛡️ Blocks', rc_blk_sub: 'combined BPG',
    rc_to: '💔 Turnovers', rc_to_sub: 'combined TOPG',
    rc_fg: '🎳 FG%', rc_fg_sub: 'combined field goal',
    rc_3p: '🏹 3P%', rc_3p_sub: 'combined three point',
    rc_god: 'GOD TIER 👑', rc_god_desc: 'Dominant roster, no weak spots',
    rc_elite: 'ELITE ⭐', rc_elite_desc: 'Very strong lineup, capable of winning every game',
    rc_strong: 'STRONG 💪', rc_strong_desc: 'Solid five with clear strengths',
    rc_solid: 'SOLID 👍', rc_solid_desc: 'Competent roster without obvious weaknesses',
    rc_average: 'AVERAGE 😐', rc_average_desc: 'Average lineup, room for improvement',
    rc_weak: 'WEAK 📉', rc_weak_desc: 'Roster needs reinforcement in several spots',
    rc_rebuilding: 'REBUILDING 🔨', rc_rebuilding_desc: 'Future project — lacks experience',
  },
  nl: {
    nav_dashboard: 'Dashboard', nav_matches: 'Wedstrijden', nav_stats: 'Statistieken',
    nav_add_match: '+ Wedstrijd toevoegen', nav_schedule: '📅 Schema', nav_aliases: '⚙ Instellingen',
    league_summary: 'Liga Overzicht', best_five: '🏅 Beste Vijf van de Ronde',
    team_form: '📈 Teamvorm', top3: '⭐ Top 3 Spelers', standings: 'Stand',
    see_top10: 'Zie Top 10 →', see_more: 'Meer zien →',
    match_results: 'Wedstrijdresultaten', all_seasons: 'Alle seizoenen',
    all_teams: 'Alle teams', all_players: 'Alle spelers',
    add_match: 'Wedstrijd toevoegen', add_match_btn: '+ Wedstrijd toevoegen',
    player_stats: 'Spelerstatistieken', compare: '⚡ Vergelijken',
    season_lbl: 'Seizoen', team_lbl: 'Team', position_lbl: 'Positie', all_pos: 'Alle',
    th_player: 'Speler', th_team: 'Team', th_gp: 'GP', th_grd: 'GRD',
    th_pts: 'PTS', th_reb: 'REB', th_ast: 'AST', th_stl: 'STL', th_blk: 'BLK',
    th_to: 'TO', th_fg: 'FG%', th_3p: '3P%', th_ft: 'FT%',
    schedule_title: '📅 Schema', no_schedule: 'Geen geplande wedstrijden',
    aliases_title: 'Aliassen', apply_aliases: 'Aliassen toepassen',
    logout: '🔓 Uitloggen', settings: '⚙ Instellingen', seasons_btn: '🏆 Seizoenen',
    loading: 'Laden...', save: 'Opslaan', cancel: 'Annuleren', delete: 'Verwijderen',
    edit: 'Bewerken', close: 'Sluiten', yes: 'Ja', no: 'Nee',
    games: 'wedstrijden', game: 'wedstrijd', week: 'Week',
    win: 'W', loss: 'V', draw: 'G',
    career_records: '🏆 Carrièrerecords',
    match_history: 'Wedstrijdgeschiedenis',
    hot_streak: '🔥 HOT STREAK — A- of beter in laatste 3 wedstrijden!',
    player_card: '🃏 Kaart',
    round_label: 'Ronde',
    composite_higher: 'hoger = beter', per_higher: 'hoger = beter',
    save_match: 'Wedstrijd opslaan',
    add_player: '+ Speler toevoegen',
    screenshot: 'Screenshot uploaden',
    check_save: 'Controleer & Sla op',
    no_matches: 'Geen wedstrijden',
    no_data: 'Geen gegevens',
    add_matches_for_leaders: 'Competitieleiders verschijnen na de eerste wedstrijden',
    rivals: '⚔️ Rivaliteit',
    next_matches: 'Komende wedstrijden',
    top_scorers: 'Topscorers',
    last_results: 'Recente resultaten',
    nav_events: '🏆 Evenementen',
    round_lbl: 'Ronde',
    err_data_too_large: '❌ Gegevens te groot — JSONBin limiet is ~100KB',
    err_names_diff: '❌ Namen moeten verschillend zijn',
    teams_updated: '✅ Teams bijgewerkt!',
    err_enter_team: '❌ Voer teamnaam in',
    logo_deleted: '🗑 Logo verwijderd',
    err_pick_two_teams: '❌ Kies twee verschillende teams',
    err_pick_date2: '❌ Kies een datum',
    deleted_lbl: '🗑 Verwijderd',
    no_matches_to_merge: 'Geen wedstrijden om samen te voegen',
    win_streak: 'W op rij',
    loss_streak: 'V op rij',
    stat_pts: 'Punten (gem.)',
    stat_reb: 'Rebounds (gem.)',
    stat_ast: 'Assists (gem.)',
    stat_stl: 'Steals (gem.)',
    stat_blk: 'Blocks (gem.)',
    stat_to: 'Balverliezen (gem.)',
    hot_streak_has: 'heeft',
    hot_streak_last3: 'cijfer A- of beter in laatste 3 wedstrijden',
    err_save_status: '❌ Opslagfout: ',
    err_json_file: '❌ JSON-bestandsfout: ',
    err_enter_teams: '❌ Voer beide teams in',
    err_teams_diff: '❌ Teams moeten verschillend zijn',
    err_pick_date: '❌ Kies een datum',
    err_fill_all: '❌ Vul alle velden in',
    err_date_order: '❌ Begindatum moet vóór einddatum zijn',
    err_fill_both: '❌ Vul beide velden in',
    round_deleted: '🗑 Ronde verwijderd',
    match_saved_recap: '🎉 Wedstrijd opgeslagen! Samenvatting genereren...',
    match_saved_simple: '🎉 Wedstrijd opgeslagen! Zie de tab Wedstrijden.',
    api_empty_response: 'Leeg API-antwoord. Controleer de console.',
    api_parsing: '📄 AI-antwoord ontvangen, JSON parseren...',
    api_no_json: 'Geen JSON. AI-antwoord: ',
    match_saved: '✅ Wedstrijd opgeslagen! Zie de tab Wedstrijden.',
    match_deleted: '🗑 Wedstrijd verwijderd',
    team_added: '✅ Team toegevoegd:',
    season_created: 'aangemaakt en geactiveerd',
    season_reassign: 'worden opnieuw toegewezen',
    no_alias: 'Geen teamaliassen',
    no_teams: 'Geen teams',
    min_games_for_h2h: 'Minimaal 2 wedstrijden voor H2H-statistieken',
    no_matches_round: 'Geen wedstrijden in deze ronde',
    click_player_profile: 'Klik op een speler om hun profiel te zien',
    no_matches_selected: 'Geen wedstrijden geselecteerd',
    err_no_master_key: '❌ Geen Master Key — log in als admin om gegevens op te slaan',
    err_no_master_key_import: '❌ Geen Master Key — log in als admin om import op te slaan!',
    err_load: '❌ Laadstout: ',
    err_save: '❌ Opslagfout: ',
    err_connect: '❌ Verbindingsfout: ',
    err_no_api: '❌ Geen AI geconfigureerd — voer Worker URL in bij ⚙ Instellingen',
    uploading_file: '✓ Bestand geüpload — klik op "Screenshot analyseren" om stats te lezen.',
    ai_analyzing: '🤖 AI analyseert de screenshot, even geduld...',
    ai_spinner: '<div class="spinner"></div> Analyseren...',
    saving_db: '⏳ Opslaan in database...',
    merged_ok: '✅ Samengevoegd!',
    generating_prediction: '⏳ AI-voorspelling genereren...',
    generating_recap: '⏳ Samenvatting genereren...',
    save_ok: '✅ Opslaan',
    delete_btn: '✕ Verwijderen',
    merging: '⏳ Samenvoegen...',
    no_pos_data: 'Onvoldoende gegevens (spelers hebben posities nodig)',
    first_five_lbl: 'Eerste Vijf',
    second_five_lbl: 'Tweede Vijf',
    def_five_lbl: 'Defensieve Vijf',
    th_pos: 'Pos',
    games_count: 'wedstrijden',
    hot_streak_players: 'speler',
    hot_streak_suffix: 'met A- of beter in laatste',
    no_shots: 'geen worpen',
    imported_ok: 'Geïmporteerd en opgeslagen',
    matches_suffix: 'wedstrijden!',
    rc_title: '🏗️ ROSTER CALCULATOR',
    rc_subtitle: 'Kies 5 spelers en evalueer je roster',
    rc_pick: 'kies',
    rc_players: 'sp.',
    rc_rating_lbl: 'Roster beoordeling',
    rc_effective_cs: 'Effectieve CS',
    rc_avg_cs: 'GEM CS',
    rc_potential: '⚡ TEAM POTENTIEEL (gecombineerd per game)',
    rc_scale: '📋 BEOORDELINGSSCHAAL',
    rc_weak_link: '⚠️ zwak punt',
    rc_pts: '📊 Gem. punten', rc_pts_sub: 'gecombineerd PPG',
    rc_def: '🛡️ Gem. toegelaten', rc_def_sub: 'op basis van teamhistorie',
    rc_reb: '🏀 Rebounds', rc_reb_sub: 'gecombineerd RPG',
    rc_ast: '🎯 Assists', rc_ast_sub: 'gecombineerd APG',
    rc_stl: '🦅 Steals', rc_stl_sub: 'gecombineerd SPG',
    rc_blk: '🛡️ Blocks', rc_blk_sub: 'gecombineerd BPG',
    rc_to: '💔 Balverlies', rc_to_sub: 'gecombineerd TOPG',
    rc_fg: '🎳 FG%', rc_fg_sub: 'gecombineerd veldgoal',
    rc_3p: '🏹  3P%', rc_3p_sub: 'gecombineerd driepunter',
    rc_god: 'GOD TIER 👑', rc_god_desc: 'Dominant roster, geen zwakke plekken',
    rc_elite: 'ELITE ⭐', rc_elite_desc: 'Zeer sterk team, in staat elk wedstrijd te winnen',
    rc_strong: 'STRONG 💪', rc_strong_desc: 'Solide vijf met duidelijke sterke punten',
    rc_solid: 'SOLID 👍', rc_solid_desc: 'Competent roster zonder duidelijke zwakheden',
    rc_average: 'AVERAGE 😐', rc_average_desc: 'Gemiddeld team, ruimte voor verbetering',
    rc_weak: 'WEAK 📉', rc_weak_desc: 'Roster heeft versterking nodig op meerdere posities',
    rc_rebuilding: 'REBUILDING 🔨', rc_rebuilding_desc: 'Toekomstproject — mist ervaring',
  }
};

function t(key) {
  return (TRANSLATIONS[currentLang] || TRANSLATIONS.pl)[key] || (TRANSLATIONS.pl)[key] || key;
}
// ═══ 🌐 TŁUMACZENIE STRONY NA ANGIELSKI (warstwa nad całym interfejsem) ═══
// Słownik PL→EN; przy języku EN podmienia teksty w DOM, komunikatach, oknach potwierdzeń, plakatach i datach.
// Treści AI (recapy) i teksty wpisane przez użytkowników nie są tłumaczone (atrybut data-notr / długie akapity).
const PL_EN = {"Kort — gra karciana":"Kort — card game","Regulamin":"Rules","Dołącz do ligi":"Join the league","Głosowanie tygodnia":"Weekly vote","Piątka tygodnia":"Team of the Week","punkt 1 · zbiórka 1,2 · asysta 1,5 · przechwyt 3 · blok 3 · strata −1 · wygrana drużyny +2 · double-double +3 / triple-double +5 · ocena 2K od +3 (A+) do −2 (F). Punkty z wszystkich meczów tygodnia się sumują.": "point 1 · rebound 1.2 · assist 1.5 · steal 3 · block 3 · turnover −1 · team win +2 · double-double +3 / triple-double +5 · 2K grade from +3 (A+) to −2 (F). Points from all games of the week add up.", "Worker robi kopię całej ligi codziennie nad ranem (ok. 4:00–5:00) i trzyma 14 ostatnich. Przywrócenie zastępuje obecne dane — wcześniej robimy automatycznie kopię obecnego stanu.": "The Worker backs up the whole league every night (around 4:00–5:00) and keeps the last 14. Restoring replaces the current data — a backup of the current state is made automatically first.", "Edycja admina zapisuje się od razu (bez prośby i bez wpisów w Transferach). Zmiana nicku przepina połączone konto gracza na nowy nick. Każda zmiana trafia do 📝 Dziennika zmian.": "Admin edits are saved immediately (no request and no Transfer entries). Renaming a nick moves the linked player account to the new nick. Every change goes to the 📝 Change log.", "„Ostatnio” = ostatnie wejście na stronę zalogowanym kontem (zapisywane od tej aktualizacji). Osoby sprzed aktualizacji widać, jeśli głosowały, zgłaszały się albo są kapitanami.": "“Last seen” = last visit with a logged-in account (tracked since this update). People from before the update are listed if they voted, signed up or are captains.", "Link pokaże się automatycznie przy każdym meczu drużyny, w ogłoszeniu „Za godzinę” i w 🔴 NA ŻYWO. Inny link albo „bez transmisji” ustawisz przy konkretnym meczu w terminarzu.": "The link appears automatically at every team match, in the “In one hour” announcement and in 🔴 LIVE. Set a different link or “no stream” on a specific match in the schedule.", ". Wystarczy raz podać stały kanał drużyny — będzie automatycznie przy każdym meczu, w ogłoszeniu „Za godzinę” i w 🔴 NA ŻYWO. Twitch, YouTube, Kick, Facebook lub TikTok.": ". Set the team's channel once — it will appear automatically at every match, in the “In one hour” announcement and in 🔴 LIVE. Twitch, YouTube, Kick, Facebook or TikTok.", "Po zalogowaniu przez Discord zobaczysz tu mecze swojej drużyny, swoje statystyki, rzeczy do zrobienia (terminy, wyniki, głosowania) i ustawisz, w które dni możesz grać.": "After logging in with Discord you'll see your team's matches, your stats, your to-do list (dates, results, votes) and you can set which days you can play.", "Terminarz pojawi się po zamknięciu zapisów. Kapitanowie wybiorą wtedy przy każdym meczu dzień priorytetowy i zapasowy (Pn / Śr / Nd), a kibice zagłosują, kto wygra.": "The schedule will appear once sign-ups close. Captains will then pick a priority and backup day for each match (Mon / Wed / Sun), and fans will vote on who wins.", "Jeśli AI błędnie rozpoznaje nazwę zawodnika, dodaj tu korektę. Przy każdej nowej analizie screenshota błędna nazwa zostanie automatycznie zastąpiona poprawną.": "If the AI misreads a player's name, add a correction here. Every new screenshot analysis will automatically replace the wrong name with the correct one.", "= tydzień terminarza. Skład zamyka się w poniedziałek o 00:00 — kto nic nie zmieni, gra poprzednim. Zmiany po zamknięciu obowiązują od następnej kolejki.": "= a schedule week. Lineups lock on Monday at 00:00 — if you change nothing, you keep your previous lineup. Changes after the lock apply from the next round.", "Kapitanowie wybierają dla każdego spotkania dzień priorytetowy i zapasowy: Pn / Śr / Nd albo własny termin uzgodniony z rywalem. Admin zatwierdza termin.": "Captains pick a priority and backup day for each fixture: Mon / Wed / Sun or their own date agreed with the opponent. The admin confirms the date.", "automatycznie (przez zgłoszenie drużyny). Jeśli sam grasz, wybierz swój nick ze składu — wtedy pojawisz się przy nim w tabeli dostępności.": "automatically (through the team registration). If you play yourself, pick your nick from the roster — you'll then appear next to it in the availability table.", "Kanał forum: każdy agent dostaje własny wątek. Kanał tekstowy: zwykły post. Puste = sekret DISCORD_WEBHOOK_FREE_AGENTS (jeśli ustawiony).": "Forum channel: each agent gets their own thread. Text channel: a regular post. Empty = the DISCORD_WEBHOOK_FREE_AGENTS secret (if set).", "✔ = może grać (pod spodem godziny, jeśli gracz je podał) · ⏳ = konto czeka na Twoje potwierdzenie · liczą się tylko potwierdzeni gracze.": "✔ = can play (hours below, if the player set them) · ⏳ = account awaiting your confirmation · only confirmed players count.", "Ogłoszenie z plakatem po zapisaniu wyniku (potwierdzenie przez kapitana albo wynik dodany przez admina). Puste = brak ogłoszeń wyników.": "Announcement with a poster after a result is saved (captain confirmation or result added by the admin). Empty = no result announcements.", "Połącz różne nazwy tej samej drużyny. Np. \"Aliens Katowice PL\" → \"Katowice PL\". Kliknij Zastosuj aby zaktualizować wszystkie mecze.": "Merge different names of the same team. E.g. \"Aliens Katowice PL\" → \"Katowice PL\". Click Apply to update all matches.", "Wybierz drużynę i swój nick ze składu — przypisanie potwierdza kapitan drużyny. Nie ma Cię w składzie? Poproś kapitana o dopisanie.": "Pick your team and your nick from the roster — the team captain confirms it. Not on the roster? Ask your captain to add you.", "symulacji reszty sezonu z prognozą rankingu siły. ✅/❌ = rozstrzygnięte matematycznie (punkty: wygrana 2, porażka 1, walkower 0).": "simulations of the rest of the season using power-ranking predictions. ✅/❌ = mathematically decided (points: win 2, loss 1, forfeit 0).", "Kapitanowie wybierają graczy po kolei, odwracając kolejność co rundę (A→B→C→D→D→C→B→A). Najbardziej sprawiedliwa metoda.": "Captains pick players in turns, reversing the order every round (A→B→C→D→D→C→B→A). The fairest method.", "4–15 mln z formy (ostatnie 10 meczów, świeższe ważą więcej), aktualizowane w poniedziałek. Debiutant bez meczów: 5 mln.": "4–15M based on form (last 10 games, recent ones weigh more), updated on Monday. A newcomer with no games: 5M.", "Automatyczne ogłoszenia osiągnięć zaraz po zapisaniu meczu. Puste = kanał wyników (a gdy go nie ma — kanał terminarza).": "Automatic achievement announcements right after a match is saved. Empty = results channel (or the schedule channel if not set).", "Start 1500. Wygrana z mocniejszym rywalem i wyższą różnicą punktów daje więcej. Strzałka = zmiana w ostatnich 7 dniach.": "Starts at 1500. Beating a stronger opponent by a bigger margin gives more. Arrow = change over the last 7 days.", "Zamknąć zapisy drużyn? Formularz zniknie, a nowe zgłoszenia nie będą przyjmowane. Wolni agenci nadal mogą się zgłaszać.": "Close team sign-ups? The form will disappear and new registrations won't be accepted. Free agents can still sign up.", "i zabiera ją po odłączeniu. Kapitanowie dostają role po zatwierdzeniu drużyny. Gracz musi być na serwerze Discord ligi.": "and removes it when unlinked. Captains get roles once their team is approved. The player must be on the league's Discord server.", "Kandydaci wyliczeni automatycznie ze statystyk i typów kibiców z tego tygodnia. Odznacz kategorie, których nie chcesz.": "Candidates picked automatically from this week's stats and fan picks. Uncheck the categories you don't want.", "Subskrybuj kalendarz drużyny — każdy zatwierdzony termin pojawi się w nim sam (z przypomnieniem godzinę przed meczem).": "Subscribe to your team's calendar — every confirmed date appears there automatically (with a reminder one hour before).", "na stronie ligi: zaloguj się przez Discord → kliknij swoją nazwę (Mój panel) → wybierz drużynę i swój nick → Zapisz.": "on the league site: log in with Discord → click your name (My panel) → pick your team and your nick → Save.", "w tygodniu. Kapitanowie — wybierzcie na stronie dzień priorytetowy i zapasowy (Pn / Śr / Nd) dla swoich spotkań.": "this week. Captains — pick a priority and backup day (Mon / Wed / Sun) for your fixtures on the site.", "„Zamień” poprawia mecze i zapamiętuje nazwę — kolejne mecze (bot, kapitanowie, admin) dopasują się już same.": "“Replace” fixes the matches and remembers the name — future matches (bot, captains, admin) will match automatically.", "Event testowy — otwarte zapisy. Dołącz jako gracz, zamknij zapisy, wylosuj kapitanów, wyślij powiadomienia.": "Test event — sign-ups open. Join as a player, close sign-ups, draw captains, send notifications.", "Każdy nierozegrany mecz spotkania zostanie zapisany jako 20:0 (walkower: zwycięzca 2 pkt, przegrany 0 pkt).": "Every unplayed game of the fixture will be saved as 20:0 (forfeit: winner 2 pts, loser 0 pts).", "Ogłoszenia terminarza, zapowiedzi meczów, podsumowania, nagrody, Power Ranking. Puste = główny kanał ligi.": "Schedule announcements, match previews, summaries, awards, Power Ranking. Empty = main league channel.", "Definiuj kolejki ligowe. Najlepsza Piątka na dashboardzie pokazuje graczy z aktualnej kolejki (wg daty).": "Define league rounds. The Best Five on the dashboard shows players from the current round (by date).", "Kapitanowie wybierają w stałej kolejności (A→B→C→D→A→B→C→D...). Prosta, ale faworyzuje pierwsze drużyny.": "Captains pick in a fixed order (A→B→C→D→A→B→C→D...). Simple, but favors the first teams.", "Gracze przydzielani automatycznie wg statystyk z ligi — najlepsi rozłożeni równomiernie między drużyny.": "Players assigned automatically by league stats — the best ones spread evenly across teams.", "Kapitanowie wybierają graczy po kolei, odwracając kolejność co rundę. Najbardziej sprawiedliwa metoda.": "Captains pick players in turns, reversing the order every round. The fairest method.", "Kolejność: procent zwycięstw, bilans punktów i forma z 3 ostatnich meczów. Możesz poprawić komentarze.": "Order: win percentage, point differential and form over the last 3 games. You can edit the comments.", "ustaw jako aktywny i dopiero wtedy generuj terminarz. Inaczej stare wyniki trafią do nowej tabeli.": "set it as active and only then generate the schedule. Otherwise old results will end up in the new table.", "Kliknij zwycięzcę każdej pary — kolejne rundy wypełniają się z Twoich typów. Punkty za trafienie:": "Click the winner of each pair — later rounds fill in from your picks. Points per correct pick:", "Gdy wolny agent podpisze kontrakt albo gracz zmieni drużynę, zobaczysz to tutaj i na Discordzie.": "When a free agent signs or a player changes teams, you'll see it here and on Discord.", "Gracze są losowo przydzielani do drużyn. Brak interaktywnego wyboru — draft kończy się od razu.": "Players are randomly assigned to teams. No interactive picking — the draft ends immediately.", "Mecze, w których drużyna ma nazwę spoza ligi (np. nazwa z Pro-Am). Strona rozpoznaje drużynę po": "Matches where a team has a name from outside the league (e.g. a Pro-Am name). The site recognizes the team by", "Nie rozpoznano automatycznie — wybierz drużynę ręcznie albo zostaw (np. drużyna spoza ligi).": "Not recognized automatically — pick the team manually or leave it (e.g. a team from outside the league).", "wchodzi sam, gdy ktoś z piątki nie zagrał w danym tygodniu (najpierw pierwszy, potem drugi).": "comes in automatically when someone from the starting five didn't play that week (first sub first, then second).", "Bot wyśle DM do wszystkich memberów serwera. Osoby z wyłączonymi DM-ami zostaną pominięte.": "The bot will DM all server members. People with DMs disabled will be skipped.", "PER = (PTS + REB + AST + STL + BLK − pudła FG − pudła FT − TO) ÷ GP — im wyższy tym lepiej": "PER = (PTS + REB + AST + STL + BLK − missed FG − missed FT − TO) ÷ GP — higher is better", "Discord → Ustawienia kanału → Integracje → Webhooki → Nowy webhook → Kopiuj URL webhooka.": "Discord → Channel settings → Integrations → Webhooks → New webhook → Copy webhook URL.", "Kliknij aby poprawić nazwy we wszystkich już zapisanych meczach według powyższych korekt.": "Click to fix names in all saved matches using the corrections above.", "Kapitan rywala dostanie prośbę o potwierdzenie — wynik trafi do ligi po jego akceptacji.": "The opposing captain will be asked to confirm — the result goes into the league once they accept.", "⚠ Zapisy są nadal otwarte — zostaną zamknięte automatycznie po wygenerowaniu terminarza.": "⚠ Sign-ups are still open — they will close automatically once the schedule is generated.", "Cloudflare Worker przechowuje klucz Anthropic bezpiecznie — nie musisz go tu wpisywać.": "The Cloudflare Worker stores the Anthropic key securely — you don't need to enter it here.", "Klucz Gemini przechowywany bezpiecznie w Cloudflare Worker jako secret GEMINI_API_KEY.": "The Gemini key is stored securely in the Cloudflare Worker as the GEMINI_API_KEY secret.", "Wgraj screenshot z ekranu Game Stats — AI automatycznie odczyta wszystkie statystyki.": "Upload a screenshot of the Game Stats screen — the AI will read all the stats automatically.", "Gracze spoza ligi: wybierz inną nazwę z eventu lub „pominą\" żeby zachować jak jest.": "Players from outside the league: pick another name from the event or “skip” to keep it as is.", "⚠️ Brak Worker URL ani Discord Webhook URL. Skonfiguruj Worker URL w ustawieniach.": "⚠️ No Worker URL or Discord Webhook URL. Configure the Worker URL in settings.", "Brak kopii — sprawdź, czy w Cloudflare jest ustawiony harmonogram (Cron) Workera.": "No backups — check whether the Worker's schedule (Cron) is set in Cloudflare.", "Overall po drafcie (tooltip = przed draftem). ± uwzględnia pozycję i bilans W/L.": "Overall after the draft (tooltip = before the draft). ± accounts for position and W/L record.", "⚠ Termin ustalony, ale zapowiedź nie wyszła — admin może ją wysłać przyciskiem 📣": "⚠ Date set, but the preview wasn't sent — the admin can send it with the 📣 button", "Ktoś odblokował tryb boga. Następny event zweryfikuje czy to trend, czy fluk. 🎲": "Someone unlocked god mode. The next event will show if it's a trend or a fluke. 🎲", "⭐ Tylko rzadkie (triple-double, 40+ pkt, 8+ trójek, 100% z gry, kamienie milowe": "⭐ Rare only (triple-double, 40+ pts, 8+ threes, 100% FG, milestones", "Skoro tak idziesz w górę, to strzelam że niedługo będziesz GM-em. Spokojnie. 😂": "Climbing like this, I bet you'll be a GM soon. Easy now. 😂", "Jeśli otwierasz link z aplikacji Discord na telefonie — skopiuj go i otwórz w": "If you open the link from the Discord app on your phone — copy it and open it in", "Kara odejmuje punkty w tabeli bieżącego sezonu. Walkower ustawisz przyciskiem": "A penalty deducts points in the current season's table. Set a forfeit with the button", "Wysłać prywatne przypomnienia do kapitanów, którzy nie wybrali terminu w Week": "Send private reminders to captains who haven't picked a date in Week", "Transfer pojawi się w zakładce 🔁 Transfery i na Discordzie z komentarzem AI.": "The transfer will appear in the 🔁 Transfers tab and on Discord with an AI comment.", "Otwierasz stronę w przeglądarce wbudowanej w Discorda. Najpierw otwórz ją w": "You're using Discord's built-in browser. First open the page in", "Role oznaczone „⚠ wyżej niż bot” bot nie może nadać — przeciągnij rolę bota": "Roles marked “⚠ above the bot” can't be assigned — drag the bot's role", "Szukasz drużyny? Zgłoś się — kapitanowie zobaczą Cię tutaj i na Discordzie.": "Looking for a team? Sign up — captains will see you here and on Discord.", "Zostaw puste aby nie zmieniać. Hasło jest przechowywane lokalnie jako hash.": "Leave empty to keep it unchanged. The password is stored locally as a hash.", "meczów). Zastąpić go nowym? Propozycje terminów i głosy zostaną wyzerowane.": "matches). Replace it with a new one? Date proposals and votes will be reset.", "❌ Ten terminarz ma już rozegrane mecze — nie można go wygenerować ponownie": "❌ This schedule already has played matches — it can't be regenerated", "Przypomnienia + podsumowanie + Power Ranking + nagrody jednym kliknięciem": "Reminders + summary + Power Ranking + awards in one click", "Taki skok overalla to się widuje raz na kilka eventów. Zapamiętają Cię. 👑": "An overall jump like this happens once every few events. They'll remember you. 👑", "Widziałem Twój ostatni event. Liga też widziała. Pora coś z tym zrobić. 😏": "I saw your last event. So did the league. Time to do something about it. 😏", "Wszyscy mają gorszy period. Twój właśnie dobiegł końca — teraz odbijaš. 🏹": "Everyone has a rough patch. Yours just ended — now you bounce back. 🏹", "Nie udało się narysować plakatu (logo z obcego serwera blokuje eksport).": "Couldn't draw the poster (a logo from another server blocks the export).", "Pierwszy event był tylko rozgrzewką. Na tym pokażesz prawdziwy poziom. 🔥": "The first event was just a warm-up. Show your real level in this one. 🔥", "Powiadomienia 🔴 NA ŻYWO z linkami do streamów. Puste = kanał terminarza.": "🔴 LIVE notifications with stream links. Empty = schedule channel.", "Statystyki nie kłamią — a Twoje jeszcze nie istnieją. Czas to zmienić. 📋": "Stats don't lie — and yours don't exist yet. Time to change that. 📋", "Naprawdę? Aż tyle? No dobra, grunt że się zapisałeś. Odrabiaj straty. 📉": "Really? That much? Well, at least you signed up. Time to make up for it. 📉", "Nazwy z screenów po lewej → wybierz prawidłową nazwę z listy po prawej.": "Names from screenshots on the left → pick the correct name from the list on the right.", "Odśwież logowanie — potrzebne do zgłoszeń, głosowania i wyboru terminów": "Refresh your login — needed for sign-ups, voting and picking dates", "Debiut zaliczony. Teraz już wiesz o co chodzi — czas to wykorzystać. 💡": "Debut done. Now you know what it's about — time to make use of it. 💡", "Doświadczenie, build, dostępność w tygodniu, czego szukasz w drużynie…": "Experience, build, weekly availability, what you're looking for in a team…", "Google odświeża subskrypcje co kilka godzin, Apple i Outlook częściej.": "Google refreshes subscriptions every few hours, Apple and Outlook more often.", "Poproś admina o uruchomienie draftu — token nie jest jeszcze dostępny.": "Ask the admin to start the draft — the token isn't available yet.", "Prognoza z rankingu siły (Elo) — szansa na wygranie pojedynczego meczu": "Power ranking (Elo) prediction — chance of winning a single game", "Utwórz role na serwerze (np. „League Member” i opcjonalnie „Kapitan”).": "Create roles on the server (e.g. “League Member” and optionally “Captain”).", "potwierdzonych kont · kliknij drużynę, aby zobaczyć skład i dostępność": "confirmed accounts · click a team to see its roster and availability", "— link otworzył się w wbudowanej przeglądarce która blokuje logowanie.": "— the link opened in a built-in browser that blocks logging in.", "✓ Plik wgrany — kliknij \"Analizuj Screenshot\" aby odczytać statystyki.": "✓ File uploaded — click \"Analyze Screenshot\" to read the stats.", "Kliknij gracza, żeby zobaczyć jego piątkę (Ⓒ kapitan ×2, 🔄 zmiennik).": "Click a player to see their five (Ⓒ captain ×2, 🔄 substitute).", "Dodaj drużyny i wgraj ich loga. Drużyny są dostępne w harmonogramie.": "Add teams and upload their logos. Teams are available in the schedule.", "Ekhm. Spory dół. Ale Syzyf też nie rezygnował — i Ty nie rezygnuj. 🪨": "Ahem. Quite a drop. But Sisyphus didn't give up — neither should you. 🪨", "Każda legenda zaczynała od pierwszego meczu. To jest właśnie Twój. 🏆": "Every legend started with a first game. This is yours. 🏆", "Malutki dołek, takie rzeczy się zdarzają. Odbijesz na tym evencie. 🔄": "A tiny dip, it happens. You'll bounce back at this event. 🔄", "Wygrane-Porażki. +3 OVR przy 100% wygranych, -3 przy 100% porażkach.": "Wins-Losses. +3 OVR at 100% wins, -3 at 100% losses.", "Wyślij DM do wszystkich memberów serwera z informacją o tym evencie.": "Send a DM to all server members about this event.", "po meczu (jeden mecz = jeden screen). AI odczyta wynik i statystyki.": "after the game (one game = one screenshot). The AI will read the score and stats.", "❌ Nie udało się dokończyć logowania przez Discord — spróbuj ponownie": "❌ Couldn't complete the Discord login — please try again", "Karma? Pech? Forma? Jedno z trzech. Może wszystkie. Odbuduj się. 🛠️": "Karma? Bad luck? Form? One of the three. Maybe all. Rebuild. 🛠️", "Stabilność to cnota — ale 99 nie przyjdzie samo. Czas zaatakować. 🎯": "Consistency is a virtue — but 99 won't come by itself. Time to attack. 🎯", "Zero zmian. Świat się kręci, Ty stoisz. Może czas przyspieszyć? ⏩": "Zero change. The world keeps turning, you stand still. Time to speed up? ⏩", "jeszcze nie wystartował. Odśwież stronę gdy admin uruchomi draft.": "hasn't started yet. Refresh the page when the admin starts the draft.", "Bez zmian. Dobrze czy źle? Zależy co z tym zrobisz na evencie. 🤷": "No change. Good or bad? Depends on what you do at the event. 🤷", "Plateau. Wszyscy przez to przechodzą. Nieliczni je przebijają. 🧱": "A plateau. Everyone goes through it. Few break through. 🧱", "Próbka to nie ocena. Na tym evencie piszesz historię od nowa. ✍️": "A sample isn't a verdict. At this event you rewrite the story. ✍️", "Tyle punktów w dół... Może warto spać wcześniej przed eventem? 😅": "That many points down... Maybe sleep earlier before the event? 😅", "Wszystko, co zmieniło się od tamtej chwili, zostanie zastąpione.": "Everything that changed since then will be replaced.", "żeby wybrać kandydatów (potrzeba min. 2 meczów ze statystykami).": "to pick candidates (at least 2 games with stats are needed).", "— wynik zapisze się od razu (bez potwierdzania przez kapitanów).": "— the result is saved immediately (no captain confirmation).", "— pewnie z poprzednich rozgrywek. Dla nowego sezonu utwórz go w": "— probably from previous competitions. For a new season create it in", "📺 Link do overlaya skopiowany! Wklej jako Browser Source w OBS.": "📺 Overlay link copied! Paste it as a Browser Source in OBS.", "Nick nie może być pusty — zaznacz „usuń”, jeśli gracz odchodzi": "The nick can't be empty — tick “remove” if the player is leaving", "Oficjalny turniej drużynowy. Zapisy otwarte do końca miesiąca.": "Official team tournament. Sign-ups open until the end of the month.", "Trochę w dół, ale nie tragedia. Jeden dobry event i wracasz. 🔁": "A bit down, but no tragedy. One good event and you're back. 🔁", "❌ Brak Master Key — zaloguj się jako admin aby zapisać import!": "❌ No Master Key — log in as admin to save the import!", "🎮 Róbcie screeny z wynikami meczów. Powodzenia dla wszystkich!": "🎮 Take screenshots of your match results. Good luck everyone!", "Ranking pojawi się po pierwszych rozegranych meczach z typami": "The ranking will appear after the first played matches with picks", "❌ Brak Master Key — zaloguj się jako admin aby zapisywać dane": "❌ No Master Key — log in as admin to save data", "🔐 Sesja wygasła. Podaj hasło draftu ponownie aby kontynuować.": "🔐 Session expired. Enter the draft password again to continue.", "Brak eventów — kliknij \"+ Nowy Event\" aby stworzyć pierwszy.": "No events — click \"+ New Event\" to create the first one.", "Chyba ktoś grał w nocy i coś mu kliknęło. Naprawdę nieźle. 😎": "Looks like someone grinded at night and it clicked. Really nice. 😎", "Forma trzyma. Teraz przełóż ją na parkiet i uderz mocniej. 💥": "The form holds. Now bring it to the court and hit harder. 💥", "Kapitanowie — otwórzcie swój Panel GM i dokonajcie picków! 🎮": "Captains — open your GM Panel and make your picks! 🎮", "Kilka złych meczów to nie koniec kariery. Wróć mocniejszy. 💎": "A few bad games aren't the end of a career. Come back stronger. 💎", "Skonfiguruj Worker URL w ustawieniach aby wygenerować linki.": "Configure the Worker URL in settings to generate links.", "Zdarza się najlepszym. Kluczowe co zrobisz na tym evencie. 🔑": "It happens to the best. What matters is what you do at this event. 🔑", "Dodaj akcję (YouTube, Twitch, Medal, Streamable, X, TikTok": "Add a highlight (YouTube, Twitch, Medal, Streamable, X, TikTok", "Nie spektakularnie, ale do przodu. Każdy punkt się liczy. 🔢": "Not spectacular, but forward. Every point counts. 🔢", "No to były ciężkie mecze. Nie ma co płakać — trzeba grać. 😤": "Those were tough games. No crying — keep playing. 😤", "Startowa wartość ustalona. Jedyna droga — w górę. Prawda? 📈": "Starting value set. The only way is up. Right? 📈", "Wiadomość prywatna do kapitanów, którzy nie wybrali terminu": "Private message to captains who haven't picked a date", "⚠️ Nie można pobrać automatycznie — otwieram w nowej karcie": "⚠️ Can't download automatically — opening in a new tab", "Akceptacja od razu ustala termin — bez czekania na admina.": "Accepting sets the date right away — no waiting for the admin.", "Ani w górę, ani w dół. Klasyczny pat. Czas go przełamać. 🎲": "Neither up nor down. A classic stalemate. Time to break it. 🎲", "Jak zdobyć ID: Discord → Ustawienia → Zaawansowane → włącz": "How to get the ID: Discord → Settings → Advanced → enable", "Usunąć ten webhook? Powiadomienia wrócą na kanał domyślny.": "Remove this webhook? Notifications will go back to the default channel.", "Wybierz kapitana każdej drużyny lub wylosuj automatycznie.": "Pick a captain for each team or draw them automatically.", "⚠ Głosowanie zamknięte, ale Discord nie przyjął wiadomości": "⚠ Voting closed, but Discord didn't accept the message", "Krok do przodu. Nie zatrzymuj się, kolejny event czeka. 🏀": "A step forward. Don't stop, the next event is waiting. 🏀", "Pierwszy mecz zawsze boli. Drugi już mniej. Powodzenia! 😬": "The first game always hurts. The second less. Good luck! 😬", "Przeczytałem i akceptuję regulamin, który znajduje się na": "I have read and accept the rules, which can be found on", "Statystyki mówią \"nie\". Ty na evencie powiesz \"owszem\". 😤": "The stats say \"no\". At the event you'll say \"oh yes\". 😤", "✅ Draft załadowany — kliknij ▶ Start gdy GMowie są gotowi": "✅ Draft loaded — click ▶ Start when the GMs are ready", "Plus na koncie. Z takim tempem za rok będziesz bogiem. 📈": "A plus on the board. At this pace you'll be a god in a year. 📈", "Po instalacji zaloguj się raz przez Discord w aplikacji.": "After installing, log in once with Discord in the app.", "Przeglądarka nie pozwala kopiować obrazów — użyj Pobierz": "Your browser doesn't allow copying images — use Download", "Skład jest pełny — usuń kogoś albo kliknij puste miejsce": "The lineup is full — remove someone or click an empty slot", "Wyślij powiadomienie do kapitanów przez Discord Webhook.": "Send a notification to captains via Discord Webhook.", "Zakończyć głosowanie i ogłosić zwycięzców na Discordzie?": "End voting and announce the winners on Discord?", "jest wyżej niż rola bota — przeciągnij rolę bota nad nią": "is above the bot's role — drag the bot's role above it", "Bądź pierwszy — zgłoś swoją drużynę do sezonu NBA 2K27!": "Be the first — register your team for the NBA 2K27 season!", "Nadać role wszystkim potwierdzonym graczom i kapitanom?": "Assign roles to all confirmed players and captains?", "Overall wyznaczony. Droga do 99 właśnie się zaczęła. 🗺️": "Overall set. The road to 99 has just begun. 🗺️", "Pary posortowane wg liczby meczow · wynik to bilans W–L": "Pairs sorted by number of games · score is the W–L record", "Za mało danych (zawodnicy muszą mieć przypisane pozycje": "Not enough data (players must have positions assigned", "Zatwierdzić zmianę składu? Utworzy wpisy w Transferach.": "Approve the roster change? It will create Transfer entries.", "Brak terminarza dla tego sezonu. Zatwierdzone drużyny:": "No schedule for this season. Approved teams:", "Forma faluje — to normalne. Ważne żeby fala wróciła. 🌊": "Form goes in waves — that's normal. What matters is the wave comes back. 🌊", "Inni też trenują — ale Ty też, i WIDAĆ. Tak trzymaj. 💪": "Others train too — but so do you, and it SHOWS. Keep it up. 💪", "Mały plus, ale jednak plus. Syzyf by się uśmiechnął. 🪨": "A small plus, but a plus. Sisyphus would smile. 🪨", "Podaj okno godzin (1–3 h) dla obu dni, np. 20:00–22:00": "Set a time window (1–3 h) for both days, e.g. 20:00–22:00", "Usunąć wpis o transferze? (post na Discordzie zostanie": "Delete the transfer entry? (the Discord post will remain", "• głosowanie na nagrody tygodnia → Dashboard + Discord": "• weekly awards voting → Dashboard + Discord", "❌ Nie znaleziono draftu. Może jeszcze nie wystartował?": "❌ Draft not found. Maybe it hasn't started yet?", "Discord zablokował logowanie z Twojego konta z powodu": "Discord blocked login from your account due to", "Ktoś musi być najnowszym — dziś to Ty. Nie zawiedź. 🆕": "Someone has to be the newest — today it's you. Don't let us down. 🆕", "Overall zamrożony. Odmrozi się tylko na parkiecie. ❄️": "Overall frozen. It only thaws on the court. ❄️", "Walkover (W/O) — odznacz aby zmienic na normalny mecz": "Forfeit (W/O) — uncheck to change to a normal match", "— osoby znane stronie (agenci, kapitanowie, eventy) —": "— people known to the site (agents, captains, events) —", "✅ Mecz zapisany! Możesz zobaczyć go w zakładce Mecze.": "✅ Match saved! You can see it in the Matches tab.", "✅ Powiązania, metoda OVR i ręczne overrides zapisane!": "✅ Links, OVR method and manual overrides saved!", "🎉 Mecz zapisany! Możesz zobaczyć go w zakładce Mecze.": "🎉 Match saved! You can see it in the Matches tab.", "Etykieta nałożona. Teraz pytanie — czy ona kłamie? 🎯": "Label applied. Now the question — is it lying? 🎯", "Zaloguj się ponownie przez Discord, aby się zgłosić.": "Log in again with Discord to sign up.", "Zaloguj się przez Discord, żeby zbudować swój skład.": "Log in with Discord to build your lineup.", "✅ Skopiowano do schowka! Wklej na Discordzie (Ctrl+V": "✅ Copied to clipboard! Paste it on Discord (Ctrl+V", "🤝 Remis — nikt nie trafił, nikt nie przegrał zakładu": "🤝 Draw — nobody got it right, nobody lost the bet", "BOOM! Rakieta startuje. Czy ktoś zawiadomił NASA? 🚀": "BOOM! The rocket is launching. Has anyone told NASA? 🚀", "Liga czeka. Ty zapisany. Teraz już tylko parkiet. 🏀": "The league awaits. You're signed up. Now it's all about the court. 🏀", "Minus jest. Ale jeszcze nie alarm. Czas działać. ⚠️": "It's a minus. But not an alarm yet. Time to act. ⚠️", "Statystyki trochę w dół, ale mecze wygrasz głową. 🧠": "Stats a bit down, but you'll win games with your head. 🧠", "Symulacja trwającego draftu — 3 picki już wykonane.": "Simulation of an ongoing draft — 3 picks already made.", "Za mało rozegranych meczów, żeby wybrać kandydatów.": "Not enough games played to pick candidates.", "✅ Zapisano — od teraz role nadają się automatycznie": "✅ Saved — roles are now assigned automatically", "❌ Ten sam gracz nie może być kapitanem dwóch drużyn": "❌ The same player can't captain two teams", "🔥 HOT STREAK — A- lub lepsza w ostatnich 3 meczach!": "🔥 HOT STREAK — A- or better in the last 3 games!", "Dane zostaną zapisane tylko w Twojej przeglądarce.": "The data will only be saved in your browser.", "Fantasy ruszy, gdy terminarz sezonu będzie gotowy.": "Fantasy will start once the season schedule is ready.", "Losowanie do grup, w każdej grupie każdy z każdym.": "Draw into groups, round robin within each group.", "Porównuj graczy vs ich wyniki na tej samej pozycji": "Compare players with others at the same position", "Progres mały, ale prawdziwy. Szacunek za robotę. 👊": "Small progress, but real. Respect for the work. 👊", "Tyle samo co ostatnio. Liga czeka na coś więcej. 🥱": "Same as last time. The league is waiting for more. 🥱", "⚠️ Zaloguj się przez Discord aby otworzyć Panel GM": "⚠️ Log in with Discord to open the GM Panel", "✅ Połączono! Udostępnij link z paska adresu innym.": "✅ Connected! Share the link from the address bar with others.", "✅ Zapisano — kapitan dostał prośbę o potwierdzenie": "✅ Saved — the captain received a confirmation request", "❌ Brak konfiguracji AI — podaj Worker URL w ⚙ Baza": "❌ No AI configuration — set the Worker URL in ⚙ Database", "Jeszcze nikt nie zbudował składu — bądź pierwszy!": "Nobody has built a lineup yet — be the first!", "Liga notuje. Rywale patrzą. Nie zwalniaj teraz. 🏆": "The league takes note. Rivals are watching. Don't slow down now. 🏆", "Potwierdź — ikona pojawi się na ekranie telefonu.": "Confirm — the icon will appear on your phone's home screen.", "✅ Termin ustalony — wysyłam zapowiedź na Discord…": "✅ Date set — sending the preview to Discord…", "❌ Brak Worker URL — skonfiguruj go w ustawieniach": "❌ No Worker URL — configure it in settings", "❌ Nie można usunąć — drużyna jest w harmonogramie": "❌ Can't delete — the team is in the schedule", "🔑 Zaloguj się ponownie przez Discord (jednorazowo": "🔑 Log in again with Discord (one time", "Brak konfiguracji AI — podaj Worker URL w ⚙ Baza": "No AI configuration — set the Worker URL in ⚙ Database", "Zrob zrzut ekranu aby udostepnic karte zawodnika": "Take a screenshot to share the player card", "żeby przetestować to na przykładowych drużynach.": "to test it on sample teams.", "⏳ Poczekaj na rozstrzygnięcie meczu o 3. miejsce": "⏳ Wait for the 3rd place game to finish", "❌ Każdy kapitan może być tylko w jednej drużynie": "❌ Each captain can only be in one team", "Baza jest. Reszta to praca. No to do roboty. 🛠️": "The base is there. The rest is work. Let's get to it. 🛠️", "Dostępność zgłoszona przez graczy w Moim panelu": "Availability reported by players in My panel", "Puste = powiadomienia idą na główny kanał ligi.": "Empty = notifications go to the main league channel.", "Skład potrzebuje wzmocnienia na kilku pozycjach": "The roster needs reinforcement at several positions", "To się mówi forma! Zimna woda, gorące liczby. 🔥": "Now that's form! Cool head, hot numbers. 🔥", "Zaloguj się przez Discord, aby zgłosić drużynę.": "Log in with Discord to register a team.", "⚖️ Drużyny zbalansowane na podstawie statystyk!": "⚖️ Teams balanced based on stats!", "✅ Wszystkie nazwy graczy są zgodne z rankingiem": "✅ All player names match the ranking", "❌ Mecze mają różne drużyny — nie można połączyć": "❌ The matches have different teams — can't merge", "❌ Nie można usunąć drużyny — ma zapisane mecze!": "❌ Can't delete the team — it has saved matches!", "Admin wstrzymał draft. Poczekaj na wznowienie.": "The admin paused the draft. Wait for it to resume.", "Brak aktywnego sezonu — mecze bez przypisania.": "No active season — matches without assignment.", "Cofnąłeś się krok, żeby skoczyć dwa. Klasyk. 🏋": "You stepped back to jump two. Classic. 🏋", "Przeciągnij aby zmienić kolejność lub wylosuj.": "Drag to change the order or draw it.", "Witaj w lidze! Czas pokazać co masz w sobie. 🌟": "Welcome to the league! Time to show what you've got. 🌟", "już typuje · punkty rosną w kolejnych rundach:": "already picking · points grow in later rounds:", "kapitan nie ustawił jeszcze swojej dostępności": "the captain hasn't set their availability yet", "⚠️ Ten gracz jest już wybrany na innej pozycji": "⚠️ This player is already picked at another position", "✅ Zapisano — na kanał poszła wiadomość testowa": "✅ Saved — a test message was sent to the channel", "❌ Nie można usunąć drużyny — ma zapisane mecze": "❌ Can't delete the team — it has saved matches", "Demo Draft — otwarte zapisy (test powiadomień": "Demo Draft — sign-ups open (notification test", "Jako kapitan wybierasz graczy podczas draftu.": "As captain you pick players during the draft.", "Kliknij lub przeciągnij plik · PNG, JPG, WebP": "Click or drag a file · PNG, JPG, WebP", "Nie rewolucja, ale ewolucja. I o to chodzi. 🧬": "Not a revolution, but evolution. That's the point. 🧬", "Nowa twarz, nowe możliwości. Zrób wrażenie! 👀": "New face, new opportunities. Make an impression! 👀", "Podaj godziny „od” i „do” (koniec po początku": "Set “from” and “to” hours (end after start", "Projekt na przyszłość — brakuje doświadczenia": "A project for the future — lacks experience", "Zostaw puste aby użyć domyślnej wiadomości...": "Leave empty to use the default message...", "✅ Migracja zakończona — dane w Cloudflare KV!": "✅ Migration complete — data in Cloudflare KV!", "✅ Wszystkie mecze mają poprawne nazwy drużyn.": "✅ All matches have correct team names.", "Bardzo silny skład, zdolny wygrać każdy mecz": "A very strong roster, capable of winning any game", "Bot sam nadaje rolę, gdy kapitan (albo admin": "The bot assigns the role automatically when the captain (or admin", "Brak meczów — dodaj screeny w zakładce Mecze": "No matches — add screenshots in the Matches tab", "Jeszcze żaden termin nie został zatwierdzony": "No date has been confirmed yet", "Nie znaleziono danych OVR dla żadnego gracza": "No OVR data found for any player", "Okno transferowe (dopisywanie / usuwanie) do": "Transfer window (adding / removing) until", "Turniej 1v1. Top 16 graczy — zapisy wkrótce.": "1v1 tournament. Top 16 players — sign-ups soon.", "Tutaj wybierz serwer i role z listy, kliknij": "Pick the server and roles from the list here, click", "Usuń playoff? Tej operacji nie można cofnąć.": "Delete the playoff? This can't be undone.", "wybierana automatycznie, ogłoszona na gali):": "picked automatically, announced at the gala):", "— rekordy pojawią się po pierwszych meczach.": "— records will appear after the first matches.", "🤖 Auto-dopasowanie gotowe — sprawdź i zapisz": "🤖 Auto-match done — review and save", ". Typy możesz zmieniać do startu playoffów.": ". You can change your picks until the playoffs start.", "Brak meczów — dodaj pierwszy screen poniżej": "No matches — add the first screenshot below", "Dominujący skład, żaden slot nie jest słaby": "A dominant roster, no weak slot", "Kliknij na gracza aby zobaczyć pełną kartę.": "Click a player to see the full card.", "Przejdź do Panelu GM aby zarządzać drużyną.": "Go to the GM Panel to manage your team.", "Ten gracz jest już wybrany na innej pozycji": "This player is already picked at another position", "Zaloguj się przez Discord, aby się zgłosić.": "Log in with Discord to sign up.", "automatycznie pingują graczy na Discordzie.": "automatically ping players on Discord.", "lub do następnego dnia) i spróbuj ponownie.": "or until the next day) and try again.", "skład zacznie punktować od kolejnej kolejki": "the lineup will start scoring from the next round", "⚠ Brak wspólnego dnia — termin ustala admin": "⚠ No common day — the admin sets the date", "✅ Screenshot załadowany — kliknij Analizuj!": "✅ Screenshot loaded — click Analyze!", "🗳 Głosowanie otwarte — jest na Dashboardzie": "🗳 Voting is open — it's on the Dashboard", "🤖 AI analizuje screenshot, proszę czekać...": "🤖 The AI is analyzing the screenshot, please wait...", "Brak rozstrzygniętych typów w tym tygodniu": "No settled picks this week", "Dodaj pierwszy mecz klikając \"+ Dodaj Mecz": "Add the first match by clicking \"+ Add Match", "Kandydaci ze statystyk całego sezonu (min.": "Candidates from whole-season stats (min.", "Nikt z drużyny nie połączył jeszcze konta.": "Nobody from the team has linked an account yet.", "Ręczny override — kliknij ✕ aby przywrócić": "Manual override — click ✕ to restore", "kapitan połączony przez zgłoszenie drużyny": "captain linked through the team registration", "✅ Drużyna zgłoszona! Czeka na weryfikację.": "✅ Team registered! Awaiting review.", "✅ Link GM skopiowany! Wyślij go kapitanom.": "✅ GM link copied! Send it to the captains.", "📋 Skopiowano — wklej na Discordzie (Ctrl+V": "📋 Copied — paste it on Discord (Ctrl+V", "🔒 Webhooki Discord przeniesione do Workera": "🔒 Discord webhooks moved to the Worker", "2 mecze zaznaczone — gotowe do połączenia": "2 matches selected — ready to merge", "Głos kapitana drużyny liczy się podwójnie": "A team captain's vote counts double", "Jeszcze nikt nie dodał akcji z tego meczu": "Nobody has added a highlight from this match yet", "Kolejność drużyn (przeciągnij aby zmienić": "Team order (drag to change", "Wybierz metodę draftu przed rozpoczęciem.": "Choose the draft method before starting.", "ocenę A- lub lepszą w ostatnich 3 meczach": "an A- grade or better in the last 3 games", "✅ Wszyscy kapitanowie wybrali już terminy": "✅ All captains have already picked dates", "❌ Brak Discord Webhook URL w konfiguracji": "❌ No Discord Webhook URL in the configuration", "❌ Drużyna o tej nazwie już jest zgłoszona": "❌ A team with this name is already registered", "❌ Tylko admin może analizować screenshoty": "❌ Only the admin can analyze screenshots", "👆 Twoja kolej! Kliknij gracza aby wybrać.": "👆 Your turn! Click a player to pick.", "Brak zatwierdzonych drużyn w tym sezonie": "No approved teams this season", "Nazwa sezonu (np. Sezon 2, Wiosna 2025):": "Season name (e.g. Season 2, Spring 2025):", "Popraw nicki (okno transferowe zamknięte": "Fix nicks (transfer window closed", "⚡ POTENCJAŁ ZESPOŁU (sumaryczne per game": "⚡ TEAM POTENTIAL (total per game", "✅ Mecze połączone! Statystyki zsumowane.": "✅ Matches merged! Stats added up.", "❌ Nieprawidłowe hasło. Spróbuj ponownie.": "❌ Wrong password. Try again.", "2K PRO-AM EKSTRAKLASA · KARTA ZAWODNIKA": "2K PRO-AM EKSTRAKLASA · PLAYER CARD", "Dołącz do Discorda Polskiej Ekstraklasy": "Join the Polish Ekstraklasa Discord", "Minimum 2 mecze do wyświetlenia wykresu": "At least 2 games needed to show the chart", "✅ Worker obsługuje webhook przez sekret": "✅ The Worker handles the webhook via a secret", "❌ Tylko główny admin może usuwać eventy": "❌ Only the main admin can delete events", "🏆 Wypełnij drabinkę w Typerze playoffów": "🏆 Fill in your bracket in the Playoff Picks", "📥 Pobrano jako PNG (schowek niedostępny": "📥 Downloaded as PNG (clipboard unavailable", "2. Jeśli problem się powtarza — poproś": "2. If the problem persists — ask", "Brak Worker URL — skonfiguruj w ⚙ Baza": "No Worker URL — configure it in ⚙ Database", "Głosowanie kibiców na nagrody tygodnia": "Fan voting for the weekly awards", "Kopiuj link GM z tokenem dla kapitanów": "Copy the GM link with a token for captains", "Przeciętny skład, jest pole do poprawy": "An average roster, room for improvement", "Ustawienia serwera → Role: przeciągnij": "Server settings → Roles: drag", "Wybierz 5 graczy i sprawdź siłę składu": "Pick 5 players and check the lineup strength", "❌ Tylko admin może generować predykcje": "❌ Only the admin can generate predictions", "Finał i mecz o 3. miejsce rozpoczęte!": "The final and the 3rd place game have started!", "KB — rozważ migrację na Cloudflare KV": "KB — consider migrating to Cloudflare KV", "Kapitanowie wybierają graczy po kolei": "Captains pick players in turns", "Kliknij zawodnika aby zobaczyc profil": "Click a player to see their profile", "Kompetentny skład bez wyraźnych dziur": "A competent roster with no obvious holes", "Pusta odpowiedź API. Sprawdź konsolę.": "Empty API response. Check the console.", "Rośnie legenda. Powoli, ale pewnie. 👑": "A legend is growing. Slowly but surely. 👑", "• Power Ranking → Dashboard + Discord": "• Power Ranking → Dashboard + Discord", "✅ Skład zapisany — obowiązuje od Week": "✅ Lineup saved — applies from Week", "❌ Wybierz kapitana dla każdej drużyny": "❌ Pick a captain for each team", "📦 Migracja danych do Cloudflare KV...": "📦 Migrating data to Cloudflare KV...", "Brak sezonów. Utwórz pierwszy sezon!": "No seasons. Create the first season!", "Brak zapisanych graczy w tym evencie": "No players signed up for this event", "Ogłoś start głosowania na Discordzie": "Announce the start of voting on Discord", "Skopiuj link do overlaya Twitch/OBS:": "Copy the Twitch/OBS overlay link:", "Zaznacz jeszcze 1 mecz do połączenia": "Select 1 more match to merge", "ktoś już zgłosił — zdecyduje kapitan": "someone already claimed it — the captain will decide", "osobna osoba do zarządzania eventami": "a separate person to manage events", "wyżej w Ustawieniach serwera → Role.": "higher in Server settings → Roles.", "— wszystkie nicki są już połączone —": "— all nicks are already linked —", "❌ Błąd połączenia. Sprawdź internet.": "❌ Connection error. Check your internet.", "📣 Zapowiedź meczu wysłana na Discord": "📣 Match preview sent to Discord", "Gotowe składy rywalizują w turnieju": "Ready teams compete in the tournament", "Głosowanie na nagrody całego sezonu": "Voting for the whole-season awards", "Głosujcie na stronie (Dashboard)! 👇": "Vote on the site (Dashboard)! 👇", "Jak przygotować serwer (jednorazowo": "How to prepare the server (one time", "Powiązania Discord→PSN i metoda OVR": "Discord→PSN links and OVR method", "Powód (np. niestawienie się na mecz": "Reason (e.g. no-show for a match", "Zaznacz co najmniej jedną kategorię": "Select at least one category", "meczów). Głosują wszyscy zalogowani": "games). Everyone logged in can vote", "⏳ Czekasz na potwierdzenie kapitana": "⏳ Waiting for the captain's confirmation", "⚙ Kanał Discord — zgłoszenia drużyn": "⚙ Discord channel — team registrations", "✅ Powiadomienie wysłane na Discord!": "✅ Notification sent to Discord!", "✅ Screenshot z Discord załadowany —": "✅ Screenshot from Discord loaded —", "❌ Data od musi być wcześniej niż do": "❌ The start date must be before the end date", "❌ Tylko admin może generować recapy": "❌ Only the admin can generate recaps", "🏆 Draft zakończony! Drużyny gotowe.": "🏆 Draft complete! Teams are ready.", "📲 Zainstaluj aplikację na telefonie": "📲 Install the app on your phone", "🔄 Nadaj role wszystkim połączonym": "🔄 Assign roles to everyone linked", "? Status zmieni się na Zakończony.": "? The status will change to Finished.", "Brak meczów dla wybranych filtrów.": "No matches for the selected filters.", "Kopiuj link do overlaya Twitch/OBS": "Copy the Twitch/OBS overlay link", "Nowy link webhooka (zastąpi obecny": "New webhook link (replaces the current one", "Opis, np. Wsad nad dwoma obrońcami": "Description, e.g. Dunk over two defenders", "Potrzeba min. 2 drużyn do drabinki": "At least 2 teams are needed for a bracket", "Skopiuj link poniżej i otwórz go w": "Copy the link below and open it in", "Solidna piątka z wyraźnymi atutami": "A solid five with clear strengths", "Użyj przycisków przy każdej parze!": "Use the buttons at each pair!", "Wycofać zgłoszenie wolnego agenta?": "Withdraw the free agent listing?", "Wysłać ponownie na Discord termin:": "Resend the date to Discord:", "kliknij gracza aby zobaczyć profil": "click a player to see their profile", "połączony przez zgłoszenie drużyny": "linked through the team registration", "— upewnij się, że rywal się zgadza": "— make sure the opponent agrees", "⏳ Pobieram serwery i role od bota…": "⏳ Fetching servers and roles from the bot…", "🎉 Mecz zapisany! Generuję recap...": "🎉 Match saved! Generating a recap...", "🔁 Transfer ogłoszony na Discordzie": "🔁 Transfer announced on Discord", "Bezbłędny (100% FG, min. 8 rzutów": "Flawless (100% FG, min. 8 shots", "Draft w trakcie — Snake 4 drużyny": "Draft in progress — Snake, 4 teams", "Kanał Discord dla wolnych agentów": "Discord channel for free agents", "Kliknij aby powiększyć/zmniejszyć": "Click to zoom in/out", "NAD te role i daj jej uprawnienie": "ABOVE these roles and give it the permission", "Termin zostanie od razu ustalony.": "The date will be set right away.", "Wszystkie drafty zostały wykonane": "All picks have been made", "Wybierz przeciwnika do porównania": "Pick an opponent to compare", "Za mało rozegranych meczów w Week": "Not enough games played in Week", "głos kapitana liczy się podwójnie": "a captain's vote counts double", "ma uprawnienie Zarządzanie rolami": "has the Manage Roles permission", "najpierw wytypuj poprzednią rundę": "pick the previous round first", "· zagłosuj 👍, aby zobaczyć wyniki": "· vote 👍 to see the results", "— nie trafia na publiczną stronę.": "— it never reaches the public site.", "• podsumowanie tygodnia → Discord": "• weekly summary → Discord", "✅ Zalogowano jako manager eventów": "✅ Logged in as event manager", "✅ Załadowano 5 eventów testowych!": "✅ Loaded 5 test events!", "❌ Nie znaleziono gracza w meczach": "❌ Player not found in matches", "🏆 Hasło managera eventów zapisane": "🏆 Event manager password saved", "🤝 Kibice byli podzieleni po równo": "🤝 Fans were split down the middle", ": nie ma takiej roli na serwerze": ": no such role on the server", "Nowi gracze (jeden nick w linii": "New players (one nick per line", "Brak danych z bieżącego tygodnia": "No data from the current week", "Brak graczy dla wybranego filtra": "No players for the selected filter", "Dodaj mecze aby zobaczyć liderów": "Add matches to see the leaders", "Inny termin uzgodniony z rywalem": "Another date agreed with the opponent", "Minimum 2 mecze do statystyk H2H": "At least 2 games for H2H stats", "Otworzyć ponownie zapisy drużyn?": "Reopen team sign-ups?", "Podsumowanie tygodnia na Discord": "Weekly summary to Discord", "Ustaw hasło dla managera eventów": "Set a password for the event manager", "błędów (sprawdź uprawnienia bota": "errors (check the bot's permissions", "zbyt wielu prób w krótkim czasie": "too many attempts in a short time", "❌ Brak Worker URL w konfiguracji": "❌ No Worker URL in the configuration", "❌ Discord nie przyjął wiadomości": "❌ Discord didn't accept the message", "❌ ID to same cyfry (15–21 znaków": "❌ The ID is digits only (15–21 characters", "🎮 MÓJ PROFIL GRACZA I DOSTĘPNOŚĆ": "🎮 MY PLAYER PROFILE AND AVAILABILITY", "📊 RANKING WSZYSTKICH GRACZY LIGI": "📊 RANKING OF ALL LEAGUE PLAYERS", "📨 Wyślij powiadomienie o evencie": "📨 Send an event notification", "Brak wolnych agentów na pozycji": "No free agents at position", "Błędna nazwa (jak AI rozpoznaje": "Wrong name (as the AI reads it", "Do jakiej drużyny? (opcjonalnie": "Which team? (optional", "Gotowe. Możesz zamknąć to okno.": "Done. You can close this window.", "Inny link tylko dla tego meczu:": "A different link for this match only:", "Nicki w składzie się powtarzają": "Nicks in the roster are duplicated", "Szukaj (drużyna, osoba, akcja)…": "Search (team, person, action)…", "gdy zapisy będą zamknięte, albo": "when sign-ups are closed, or", "nie ustawił jeszcze dostępności": "hasn't set availability yet", "ocenę A- lub lepszą w ostatnich": "an A- grade or better in the last", "· zagłosuj, aby zobaczyć wyniki": "· vote to see the results", "— czeka na potwierdzenie rywala": "— waiting for the opponent's confirmation", "⏳ AI odczytuje screen… (do 30 s": "⏳ The AI is reading the screenshot… (up to 30 s", "⏸ Wyłączone (ogłaszam ręcznie 📣": "⏸ Off (I announce manually 📣", "─ bez zmian po ostatnim evencie": "─ no change after the last event", "✅ (demo) Zapisano wybór terminu": "✅ (demo) Date pick saved", "✅ Odczytano statystyki! Drużyna": "✅ Stats read! Team", "❌ Draft jeszcze nie jest gotowy": "❌ The draft isn't ready yet", "❌ Remis niedozwolony w drabince": "❌ A draw isn't allowed in the bracket", "🎉 Gratulacje dla całej drużyny!": "🎉 Congratulations to the whole team!", "🏀 Zgłoszenie drużyny — NBA 2K27": "🏀 Team registration — NBA 2K27", "👥 Ustaw swoją dostępność (niżej": "👥 Set your availability (below", "🔒 Link webhooka jest zapisywany": "🔒 The webhook link is saved", "🔗 Połącz konto z drużyną (niżej": "🔗 Link your account to a team (below", "🔧 Zastosuj do wszystkich meczów": "🔧 Apply to all matches", "Admin wstrzymał draft — pick #": "The admin paused the draft — pick #", "KOGO KIBICE WIDZĄ JAKO MISTRZA": "WHO FANS SEE AS CHAMPION", "Losowe przydzielenie do drużyn": "Random team assignment", "Okno transferowe jeszcze ciche": "The transfer window is still quiet", "Podaj zawodnika i nową drużynę": "Enter the player and the new team", "Tej operacji nie można cofnąć.": "This can't be undone.", "Zasady, nagrody, informacje...": "Rules, prizes, info...", "Zmień konfigurację bazy danych": "Change the database configuration", "kliknij obrazek aby powiększyć": "click the image to enlarge", "pokazuje się przy każdym meczu": "shown at every match", "skład zamknięty w poniedziałek": "lineup locked on Monday", "zawodników z historii meczów ·": "players from match history ·", "⚙ Kanał Discord — wolni agenci": "⚙ Discord channel — free agents", "✅ Przywrócono — wczytuję dane…": "✅ Restored — loading data…", "❌ Nie znaleziono eventu draftu": "❌ Draft event not found", "🎲 Drużyny losowo przydzielone!": "🎲 Teams randomly assigned!", "🏟 Jedna grupa — każdy z każdym": "🏟 One group — round robin", "🚫 Tego meczu nie transmitujemy": "🚫 This match won't be streamed", "W które dni zwykle mogę grać": "Which days I can usually play", "👥 Skład i dostępność drużyny": "👥 Team roster and availability", "Błędny klucz lub Bin ID (HTTP": "Wrong key or Bin ID (HTTP", "Każdy z każdym w całej lidze.": "Round robin across the whole league.", "Najwięcej przechwytów w meczu": "Most steals in a game", "Nie zaznaczono żadnych meczów": "No matches selected", "Notka dla admina (opcjonalnie": "Note for the admin (optional", "Ogłosić na Discordzie rekord:": "Announce the record on Discord:", "Okno ma mieć od 1 do 3 godzin": "The window must be 1 to 3 hours", "Powiadom kapitanów na Discord": "Notify captains on Discord", "Wylogowano z managera eventów": "Logged out of event manager", "Własna wiadomość (opcjonalnie": "Custom message (optional", "Zastosuj do zapisanych meczów": "Apply to saved matches", "a duplikat zostanie usunięty.": "and the duplicate will be removed.", "bez ocen, czysto statystyczny": "no grades, purely statistical", "czeka na potwierdzenie rywala": "waiting for the opponent's confirmation", "zamknięte wiadomości prywatne": "private messages closed", "zawodników · Potrzeba picków:": "players · Picks needed:", "żeby zobaczyć, jak to działa.": "to see how it works.", "• przypomnienia dla kapitanów": "• reminders for captains", "↩ Przywrócono do oczekujących": "↩ Moved back to pending", "❌ Brak przypisanych kapitanów": "❌ No captains assigned", "❌ Błąd połączenia z Workerem:": "❌ Worker connection error:", "❌ Wybierz pozycję preferowaną": "❌ Pick a preferred position", "🎖 Kanał Discord — osiągnięcia": "🎖 Discord channel — achievements", "🏆 Typy zapisane — powodzenia!": "🏆 Picks saved — good luck!", "🔗 Link skopiowany do schowka!": "🔗 Link copied to clipboard!", "🗳 Brak głosów — bądź pierwszy": "🗳 No votes — be the first", "** — przydzielono kapitanów!": "** — captains assigned!", "+ Zgłoś się jako wolny agent": "+ Sign up as a free agent", "5 w piątce + 2 rezerwowych ·": "5 starters + 2 subs ·", "Brak zdefiniowanych kolejek.": "No rounds defined.", "Koniec sezonu zasadniczego 🏁": "End of the regular season 🏁", "LINK DO STREAMA (opcjonalnie": "STREAM LINK (optional", "Nie udało się odczytać pliku": "Couldn't read the file", "Potrzebne minimum 3 drużyny.": "At least 3 teams are needed.", "Przywrócić dane ligi z kopii": "Restore league data from the backup", "Wrzuć screenshot lub kliknij": "Drop a screenshot or click", "Wybierz kapitana z piątki (Ⓒ": "Pick a captain from the starting five (Ⓒ", "Zapisy otwarte — Pickup Game": "Sign-ups open — Pickup Game", "admina o dodanie Cię ręcznie": "the admin to add you manually", "kwadrat ze strzałką w górę).": "the square with an up arrow).", "potwierdzi gracza w drużynie": "confirms the player in the team", "uzupełni się sama z Discorda": "fills in automatically from Discord", "wszystkie sezony · ten sezon": "all seasons · this season", "· 🟢 pewne · 🟡 fuzzy · 🔴 brak": "· 🟢 sure · 🟡 fuzzy · 🔴 none", "↺ Zgodne tylko dni zapasowe:": "↺ Only backup days match:", "✅ (demo) Termin zatwierdzony": "✅ (demo) Date confirmed", "❌ Najpierw wylosuj kapitanów": "❌ Draw the captains first", "❌ Wybierz dwie różne drużyny": "❌ Pick two different teams", "📊 Power Ranking opublikowany": "📊 Power Ranking published", "📺 Kanał Discord — transmisje": "📺 Discord channel — streams", "🔒 Zapisy drużyn są zamknięte": "🔒 Team sign-ups are closed", "🖼 Kliknij, aby wybrać screen": "🖼 Click to choose a screenshot", "🤝 Uzgodnione przez kapitanów": "🤝 Agreed by the captains", "Rola kapitana (opcjonalnie": "Captain role (optional", "Brak graczy dla tej drużyny": "No players for this team", "Brak zdefiniowanych korekt.": "No corrections defined.", "Brak zmian do wprowadzenia.": "No changes to apply.", "Oczekiwanie na start draftu": "Waiting for the draft to start", "Przypomnienia dla kapitanów": "Reminders for captains", "Turniej drużynowy — sezon 3": "Team tournament — season 3", "Wybierz swoją drużynę niżej": "Pick your team below", "i zapamiętać na przyszłość?": "and remember it for the future?", "połączony z kontem kapitana": "linked to the captain's account", "tylko w Twojej przeglądarce": "only in your browser", "· odśwież aby zaktualizować": "· refresh to update", "— możesz wpisać ID ręcznie.": "— you can enter the ID manually.", "— wybierz datę z kalendarza": "— pick the date from the calendar", "⋯ → Otwórz w przeglądarce).": "⋯ → Open in browser).", "⚙ Kanał Discord — terminarz": "⚙ Discord channel — schedule", "✅ Uzupełniono signupOvr dla": "✅ Filled in signupOvr for", "✅ Zapisano okno transferowe": "✅ Transfer window saved", "✅ Zgłoszenie zaktualizowane": "✅ Registration updated", "❌ Plik za duży — max 300 KB": "❌ File too large — max 300 KB", "❌ Zaloguj się przez Discord": "❌ Log in with Discord", "❌ Zaznacz dokładnie 2 mecze": "❌ Select exactly 2 matches", "🏀 Zapisy do ligi — NBA 2K27": "🏀 League sign-ups — NBA 2K27", "📤 Wysłano — czeka na admina": "📤 Sent — waiting for the admin", "🥇 ZAKOŃCZ PLAYOFF — MISTRZ:": "🥇 FINISH PLAYOFFS — CHAMPION:", "Zaznacz dokładnie 2 mecze": "Select exactly 2 matches", "Brak rozegranych playoffów": "No playoffs played", "Brak wyników w tej kolejce": "No results in this round", "Discord ID nowego kapitana": "Discord ID of the new captain", "Historyczna średnia z ligi": "Historical league average", "KOLEJNOŚĆ DRAFTU — RUNDA 1": "DRAFT ORDER — ROUND 1", "Kanał Discord dla zgłoszeń": "Discord channel for registrations", "Najdłuższa seria zwycięstw": "Longest winning streak", "Następna runda rozpoczęta!": "Next round started!", "Uzupełnij 5 + 2 zawodników": "Fill in 5 + 2 players", "Wyślij ponownie na Discord": "Resend to Discord", "Zmień skład / popraw nicki": "Change roster / fix nicks", "na podstawie meczów drużyn": "based on team matches", "np. Walkower - nieobecność": "e.g. Forfeit - no-show", "prawy górny róg w Chrome).": "top right corner in Chrome).", "za mało meczów — pominięte": "not enough games — skipped", "· zapis obowiązuje od Week": "· saving applies from Week", "— to pole jest opcjonalne.": "— this field is optional.", "⏳ Generuję predykcję AI...": "⏳ Generating an AI prediction...", "⏳ Wysyłanie powiadomień...": "⏳ Sending notifications...", "❌ Nie udało się udostępnić": "❌ Couldn't share", "🆓 Zgłoszenie — wolny agent": "🆓 Listing — free agent", "🎉 Mecz zapisany z recapem!": "🎉 Match saved with a recap!", "🏅 Najlepsza Piątka Kolejki": "🏅 Best Five of the Round", "📆 Mecze w Twoim kalendarzu": "📆 Matches in your calendar", "📥 Wybierz mecze do importu": "📥 Pick matches to import", "🔗 POWIĄZANIA DISCORD → PSN": "🔗 DISCORD → PSN LINKS", "🪪 Karta do udostępnienia": "🪪 Shareable card", "Brak meczów do połączenia": "No matches to merge", "Brak meczów w tej kolejce": "No matches in this round", "Brak obserwowanych graczy": "No followed players", "Brak zakończonych eventów": "No finished events", "Brak zaplanowanych meczów": "No scheduled matches", "Drużyna oddająca walkower": "Team forfeiting", "Kapitan zawsze w drużynie": "Captain always on the team", "Kliknij aby zobaczyć mecz": "Click to see the match", "Kopiuj obrazek do schowka": "Copy image to clipboard", "Maksymalnie 10 zawodników": "At most 10 players", "Mecz o 3. miejsce · 2 pkt": "3rd place game · 2 pts", "Najwięcej punktów w meczu": "Most points in a game", "Najwięcej zbiórek w meczu": "Most rebounds in a game", "PASUJE WAM TERMIN RYWALA?": "DOES THE OPPONENT'S DATE WORK FOR YOU?", "Ten mecz na stałym kanale": "This match on the regular channel", "Za mało meczów do wykresu": "Not enough games for the chart", "Zaloguj się przez Discord": "Log in with Discord", "dołącza do ligi NBA 2K27!": "joins the NBA 2K27 league!", "godziny się nie pokrywają": "the hours don't overlap", "najlepszy na pozycji = 98": "best at position = 98", "zostaw puste = jak zwykle": "leave empty = as usual", "ℹ️ Draft nie jest aktywny": "ℹ️ The draft isn't active", "⏳ Przygotowuję zapowiedź…": "⏳ Preparing the preview…", "✅ Rozpoznano po składzie:": "✅ Recognized by roster:", "✅ Wysłano — sprawdź kanał": "✅ Sent — check the channel", "✅ Zaktualizowano drużyny!": "✅ Teams updated!", "✏️ Edytuj moje zgłoszenie": "✏️ Edit my listing", "❌ Drużyny muszą być różne": "❌ The teams must be different", "❌ Osiągnięto limit graczy": "❌ Player limit reached", "❌ Wypełnij wszystkie pola": "❌ Fill in all fields", "🆕 OSTATNIO POBITE REKORDY": "🆕 RECENTLY BROKEN RECORDS", "🏅 Nagrody tygodnia — Week": "🏅 Weekly awards — Week", "🔄 Nazwy drużyn wg składów": "🔄 Team names by roster", "🤖 Analizuję screenshot...": "🤖 Analyzing the screenshot...", "**. Każda drużyna gra do": "**. Each team plays until", "Automatyczne ogłoszenia": "Automatic announcements", "Brak aktywnych playoffów": "No active playoffs", "Dodaj do ekranu głównego": "Add to home screen", "Maks. graczy (opcjonalne": "Max players (optional", "Mecze w Twoim kalendarzu": "Matches in your calendar", "Minimum 2 mecze wymagane": "At least 2 games required", "Najwięcej bloków w meczu": "Most blocks in a game", "Najwięcej trójek w meczu": "Most threes in a game", "Otwórz menu przeglądarki": "Open the browser menu", "Powód odrzucenia drużyny": "Reason for rejecting the team", "Sezon fantasy zakończony": "Fantasy season over", "Skład nie może być pusty": "The roster can't be empty", "Spotkanie zakończone: **": "Fixture finished: **", "Wgraj Screenshot z Meczu": "Upload a Match Screenshot", "Za mało drużyn w sezonie": "Not enough teams in the season", "Zaimportowano i zapisano": "Imported and saved", "brak historii — aktualny": "no history — current", "czeka na kapitana rywala": "waiting for the opposing captain", "przy meczu w terminarzu.": "at the match in the schedule.", "wagi dostosowane do roli": "weights adjusted to the role", "· ❌ Twój typ nietrafiony": "· ❌ Your pick missed", "— nie gram / bez nicku —": "— I don't play / no nick —", "↩ Cofnij do oczekujących": "↩ Move back to pending", "⚖️ Drużyny zbalansowane!": "⚖️ Teams balanced!", "✅ Karta drużyny pobrana!": "✅ Team card downloaded!", "✅ Zapisano wybór terminu": "✅ Date pick saved", "❌ Brak danych głosowania": "❌ No voting data", "❌ Błąd ładowania danych:": "❌ Data loading error:", "❌ Nie znaleziono sezonów": "❌ No seasons found", "❌ Wybierz główną pozycję": "❌ Pick a main position", "❌ Zgłoszenie odrzucone —": "❌ Registration rejected —", "🏀 Kanał Discord — wyniki": "🏀 Discord channel — results", "📋 Skopiowano do schowka!": "📋 Copied to clipboard!", "📺 Kanał drużyny zapisany": "📺 Team channel saved", "🔗 DOPASUJ NAZWY GRACZY —": "🔗 MATCH PLAYER NAMES —", "🔧 Popraw wszystkie mecze": "🔧 Fix all matches", ". Sprawdź dane poniżej.": ". Check the data below.", "Po pozycji (primaryPos": "By position (primaryPos", "Brak danych do eksportu": "No data to export", "Brak kar w tym sezonie.": "No penalties this season.", "Brak meczów w tej fazie": "No matches in this phase", "Brak rozegranych meczów": "No matches played", "Brak tabeli do eksportu": "No table to export", "Brak zgłoszonych drużyn": "No registered teams", "Drużyny muszą być różne": "The teams must be different", "Korekty Nazw Zawodników": "Player Name Corrections", "Liczba drużyn w playoff": "Number of teams in the playoffs", "MOŻE GRAĆ (potwierdzeni": "CAN PLAY (confirmed", "Najwięcej asyst w meczu": "Most assists in a game", "Najwyższy wynik drużyny": "Highest team score", "Nazwy drużyn wg składów": "Team names by roster", "Odrzucić zmianę składu?": "Reject the roster change?", "Poprawić nazwy drużyn w": "Fix team names in", "Przewiń w dół i wybierz": "Scroll down and choose", "Wyczyść wszystkie sloty": "Clear all slots", "🔗 Połącz mecze": "🔗 Merge matches", "· głosowanie zakończone": "· voting closed", "— min. 1 mecz w kolejce": "— min. 1 match in the round", "✅ Powiadomienia wysłane": "✅ Notifications sent", "✅ Pula graczy zapisana!": "✅ Player pool saved!", "❌ Błąd zapisu (Worker):": "❌ Save error (Worker):", "❌ Nazwy muszą być różne": "❌ The names must be different", "❌ Nie znaleziono gracza": "❌ Player not found", "🎖 Wszystkie osiągnięcia": "🎖 All achievements", "🎲 Drużyny przydzielone!": "🎲 Teams assigned!", "🎲 Kolejność wylosowana!": "🎲 Order drawn!", "🏀 Zarządzanie Drużynami": "🏀 Team Management", "📅 Zarządzanie Kolejkami": "📅 Round Management", "📣 Power Ranking wysłany": "📣 Power Ranking sent", "📸 DODAJ MECZ ZE SCREENA": "📸 ADD MATCH FROM SCREENSHOT", "🕐 zwykle w godzinach od": "🕐 usually between", "🗳 Kto wygra? Zagłosuj 👍": "🗳 Who wins? Vote 👍", "😮 Niespodzianka — tylko": "😮 Upset — only", "✅ Zatwierdź kapitanów": "✅ Confirm captains", "📺 Stały kanał drużyny": "📺 Team's regular channel", "Brak meczów do analizy": "No matches to analyze", "Brak zapisanych graczy": "No players signed up", "BŁĄD LOGOWANIA DISCORD": "DISCORD LOGIN ERROR", "Do ekranu początkowego": "Add to Home Screen", "Dodaj wynik ze screena": "Add result from screenshot", "Doświadczenie w NBA 2K": "NBA 2K experience", "Hasło managera eventów": "Event manager password", "Kliknij aby powiększyć": "Click to enlarge", "MOŻE GRAĆ Pn · Śr · Nd": "CAN PLAY Mon · Wed · Sun", "Mózg operacji (12+ AST": "Mastermind (12+ AST", "Nazwa drużyny z Pro-Am": "Team name from Pro-Am", "Niespodzianka tygodnia": "Upset of the week", "Ogłosić na Discordzie:": "Announce on Discord:", "Połącz konto z drużyną": "Link your account to a team", "Prośba o zmianę składu": "Roster change request", "Przechwyty/mecz (hist.": "Steals/game (hist.", "Sezon ma już terminarz": "The season already has a schedule", "Statystyki per pozycja": "Stats by position", "Szukaj: nick, drużyna…": "Search: nick, team…", "Ta sekcja wymaga hasła": "This section requires a password", "Ustawienia ról Discord": "Discord role settings", "Wycofać to zgłoszenie?": "Withdraw this listing?", "Władca tablic (15+ REB": "Glass cleaner (15+ REB", "Zapraszamy do zapisów!": "Sign-ups are open!", "czeka na potwierdzenie": "awaiting confirmation", "meczów), usuń duplikat": "matches), remove the duplicate", "⚡ Średnio-zaawansowany": "⚡ Intermediate", "✅ Mecz zaktualizowany!": "✅ Match updated!", "✅ Skład zaktualizowany": "✅ Roster updated", "❌ Minimum 5 zawodników": "❌ At least 5 players", "❌ Wiadomość jest pusta": "❌ The message is empty", "❌ Zgłoszenie odrzucone": "❌ Registration rejected", "❓ Jak to działa? (demo": "❓ How does it work? (demo", "➕ DODAJ GRACZA RĘCZNIE": "➕ ADD PLAYER MANUALLY", "➕ Dodaj planowany mecz": "➕ Add a planned match", "🏆 ZARZĄDZANIE SEZONAMI": "🏆 SEASON MANAGEMENT", "👥 Użytkownicy i składy": "👥 Users and rosters", "📊 Power Ranking — Week": "📊 Power Ranking — Week", "📊 Utwórz Power Ranking": "📊 Create Power Ranking", "📣 Podsumowanie wysłane": "📣 Summary sent", "📨 Wyślij do wszystkich": "📨 Send to everyone", "📲 Aplikacja na telefon": "📲 Phone app", "📲 Zainstaluj aplikację": "📲 Install the app", "👥 Dostępność drużyny": "👥 Team availability", "👥 Skład i dostępność": "👥 Roster and availability", "Brak danych z meczów.": "No match data.", "Brak danych zawodnika": "No player data", "Brak wspólnych meczów": "No shared matches", "Czas na pick (sekundy": "Pick time (seconds", "Deszcz trójek (5+ 3PM": "Raining threes (5+ 3PM", "Drużyna która wygrała": "The team that won", "Kopiuj ID użytkownika": "Copy User ID", "Najwięcej AST w meczu": "Most AST in a game", "Najwięcej BLK w meczu": "Most BLK in a game", "Najwięcej PTS w meczu": "Most PTS in a game", "Najwięcej REB w meczu": "Most REB in a game", "Najwięcej STL w meczu": "Most STL in a game", "Nikt nie zagłosował 😢": "Nobody voted 😢", "Poczekaj na admina...": "Wait for the admin...", "Podgląd wiadomości DM": "DM message preview", "Podsumowanie tygodnia": "Weekly summary", "Przekroczony budżet o": "Budget exceeded by", "Punkty/mecz w evencie": "Points/game in the event", "STATYSTYKI DRUŻYNOWE:": "TEAM STATS:", "Statystyki Zawodników": "Player Stats", "TYPER TYGODNIA — WEEK": "PICKER OF THE WEEK — WEEK", "Twoje miejsce w lidze": "Your place in the league", "Typowanie zamknięte ·": "Picks closed ·", "Usunąć to głosowanie?": "Delete this vote?", "Wytypuj całą drabinkę": "Pick the whole bracket", "Zaloguj przez Discord": "Log in with Discord", "Zawodników w drużynie": "Players per team", "Zaznacz do połączenia": "Select to merge", "i załóż darmowe konto": "and create a free account", "jeszcze nie rozegrana": "not played yet", "· Zawodników/drużynę:": "· Players/team:", "· ✅ Twój typ trafiony": "· ✅ Your pick was right", "— Wszystkie kolejki —": "— All rounds —", "— bez roli kapitana —": "— no captain role —", "— wybierz swój nick —": "— pick your nick —", "↩ Zgłoszenie usunięte": "↩ Listing removed", "⏳ Generuję zapowiedź…": "⏳ Generating the preview…", "⏳ Termin do ustalenia": "⏳ Date to be set", "⏳ Zapisuję do bazy...": "⏳ Saving to the database...", "⚡ PORÓWNAJ ZAWODNIKÓW": "⚡ COMPARE PLAYERS", "⚡ Średniozaawansowany": "⚡ Intermediate", "✅ Playoff rozpoczęty!": "✅ Playoffs started!", "✅ Termin zatwierdzony": "✅ Date confirmed", "✅ Zapowiedź zapisana!": "✅ Preview saved!", "❌ Nieprawidłowe hasło": "❌ Wrong password", "❌ Podaj nazwę drużyny": "❌ Enter the team name", "🎯 Wytypuj zwycięzców:": "🎯 Pick the winners:", "🎲 Drużyny wylosowane!": "🎲 Teams drawn!", "🏀 Nowy mecz zapisany!": "🏀 New match saved!", "🏅 Zwycięzcy ogłoszeni": "🏅 Winners announced", "🏆 Turniej zakończony!": "🏆 Tournament finished!", "📅 Termin meczu — Week": "📅 Match date — Week", "📆 Dodaj do kalendarza": "📆 Add to calendar", "📋 Generuję obrazek...": "📋 Generating the image...", "🔒 Okno transferowe do": "🔒 Transfer window until", "🗑 Usunięto zgłoszenie": "🗑 Registration deleted", "🚫 Zgłoszenie wycofane": "🚫 Listing withdrawn", "% typowało zwycięzcę": "% picked the winner", "Liczba drużyn (demo": "Number of teams (demo", "Brak dopasowania PSN": "No PSN match", "Brak meczów w edycji": "No matches in edition", "Brak wolnych agentów": "No free agents", "Każda drużyna gra do": "Each team plays until", "Kolejność pickowania": "Pick order", "Najwyższe zwycięstwo": "Biggest win", "OCZEKIWANIE NA START": "WAITING TO START", "Ulewa trójek (8+ 3PM": "Threes downpour (8+ 3PM", "Usuń z kolejki (poz.": "Remove from queue (pos.", "Usuń z obserwowanych": "Unfollow", "Wybierz nick z listy": "Pick a nick from the list", "ZAPISANO NA DRAFT! ✅": "SIGNED UP FOR THE DRAFT! ✅", "Za dużo zawodników z": "Too many players from", "Za mało danych (min.": "Not enough data (min.", "Zainstaluj aplikację": "Install the app", "Zatwierdzone drużyny": "Approved teams", "kliknij aby edytować": "click to edit", "ogłaszanie wyłączone": "announcements off", "puste = cały wieczór": "empty = the whole evening", "· post na Discordzie": "· Discord post", "· wysłano na Discord": "· sent to Discord", "— Wszystkie sezony —": "— All seasons —", "— skład i dostępność": "— roster and availability", "— wybierz kapitana —": "— pick a captain —", "✅ Walkower zapisany:": "✅ Forfeit saved:", "✅ Zapisano na event!": "✅ Signed up for the event!", "❌ Uzupełnij oba pola": "❌ Fill in both fields", "🏆 Eventy — Logowanie": "🏆 Events — Login", "🏆 USTAWIENIA PLAYOFF": "🏆 PLAYOFF SETTINGS", "🏗️ KALKULATOR SKŁADU": "🏗️ LINEUP CALCULATOR", "🏗️ Kalkulator składu": "🏗️ Lineup calculator", "📅 PROPOZYCJE TERMINU": "📅 DATE PROPOSALS", "📅 Wybierz termin: vs": "📅 Pick a date: vs", "📈 NAJWIĘKSZY PROGRES": "📈 BIGGEST PROGRESS", "📈 PORÓWNANIE SEZONÓW": "📈 SEASON COMPARISON", "📊 STATYSTYKI KOLEJEK": "📊 ROUND STATS", "📣 POWIADOM KAPITANÓW": "📣 NOTIFY CAPTAINS", "📣 Wysłano na Discord": "📣 Sent to Discord", "📺 Kanał transmisji —": "📺 Stream channel —", "🔁 Transfer ogłoszony": "🔁 Transfer announced", "🔄 Kolejka odświeżona": "🔄 Queue refreshed", "40+ punktów w meczu": "40+ points in a game", "50+ punktów w meczu": "50+ points in a game", "Mój nick ze składu": "My nick from the roster", "Spotkań w tygodniu": "Fixtures per week", "📤 Wyślij do admina": "📤 Send to the admin", "Akceptujesz termin:": "You accept the date:", "Brak aliasów drużyn": "No team aliases", "Brak meczów playoff": "No playoff matches", "Cofnij ostatni pick": "Undo the last pick", "Czekają na kapitana": "Waiting for the captain", "Dodaj do kalendarza": "Add to calendar", "Drużyna wygrywająca": "Winning team", "Najwięcej zwycięstw": "Most wins", "Sprawdź rok w dacie": "Check the year in the date", "TWOJA PIĄTKA W WEEK": "YOUR FIVE IN WEEK", "TWÓJ OBECNY OVERALL": "YOUR CURRENT OVERALL", "To nie jest obrazek": "This isn't an image", "Wszystko zrobione 👌": "All done 👌", "Wykonać pakiet Week": "Run the pack for Week", "Zatwierdzić drużynę": "Approve the team", "Zatwierdzono termin": "Date confirmed", "Zawodnik spoza ligi": "Player from outside the league", "Zbiórki/mecz (hist.": "Rebounds/game (hist.", "do analizy screenów": "for screenshot analysis", "graczach ze składów": "players from the rosters", "graczy w składach ·": "players on rosters ·", "jeszcze bez punktów": "no points yet", "meczów — maksimum 2": "matches — max 2", "np. Nowa Drużyna FC": "e.g. New Team FC", "po ostatnim evencie": "after the last event", "sprawdź konsolę F12": "check the F12 console", "termin do ustalenia": "date to be set", "uczestników · maks.": "participants · max.", "Ładowanie danych...": "Loading data...", "— porównanie vs avg": "— comparison vs avg", "— wybierz drużynę —": "— pick a team —", "⏰ TWOJA KOLEJ! Pick": "⏰ YOUR TURN! Pick", "⏳ Generuję recap...": "⏳ Generating a recap...", "⏳ czeka na kapitana": "⏳ waiting for the captain", "⏳ do potwierdzenia:": "⏳ to confirm:", "✅ Aktywowano sezon:": "✅ Season activated:", "✅ Drużyna usunięta:": "✅ Team deleted:", "✅ Zatwierdź drużyny": "✅ Approve teams", "❌ Błąd generowania:": "❌ Generation error:", "❌ Wypełnij oba pola": "❌ Fill in both fields", "❌ Za mało graczy na": "❌ Not enough players for", "🆕 NOWE REKORDY LIGI": "🆕 NEW LEAGUE RECORDS", "🎮 Wyślij na Discord": "🎮 Send to Discord", "🎯 WYBIERZ KAPITANÓW": "🎯 PICK CAPTAINS", "🏀 Dodaj wynik meczu": "🏀 Add match result", "🏀 Turniej drużynowy": "🏀 Team tournament", "🏆 Draft zakończony!": "🏆 Draft complete!", "🏆 Event zakończony!": "🏆 Event finished!", "🏛 Wszystkie rekordy": "🏛 All records", "🏳 Walkower zapisany": "🏳 Forfeit saved", "👥 Konta na stronie:": "👥 Site accounts:", "📅 Nadchodzące mecze": "📅 Upcoming matches", "📉 NAJWIĘKSZY SPADEK": "📉 BIGGEST DROP", "📜 Historia mistrzów": "📜 Champions history", "📝 Wypełnij drabinkę": "📝 Fill in the bracket", "📣 Wyślij na Discord": "📣 Send to Discord", "📸 Zgłoś wynik meczu": "📸 Report match result", "🗳 Otwórz głosowanie": "🗳 Open voting", "% kibiców typowało": "% of fans picked", "Po OVR (przedział": "By OVR (range", "zwykła dostępność": "usual availability", "🎯 RANKINGI GRACZY": "🎯 PLAYER RANKINGS", "🔗 Połącz z meczem": "🔗 Link to match", "Asysty/mecz (hist.": "Assists/game (hist.", "Brak danych gracza": "No player data", "Brak meczów gracza": "No matches for this player", "Kolejka jest pusta": "The queue is empty", "Power Ranking Week": "Power Ranking Week", "Skład i dostępność": "Roster and availability", "Stara/błędna nazwa": "Old/wrong name", "Usunięto z drużyny": "Removed from the team", "Usunąć zgłoszenie?": "Delete the registration?", "Wrzuć zrzut ekranu": "Upload a screenshot", "Wyloguj z Discorda": "Log out of Discord", "Zapamiętane nazwy:": "Remembered names:", "Zarządzanie rolami": "Manage Roles", "Zatwierdzić termin": "Confirm the date", "chce dołączyć jako": "wants to join as", "głosowanie otwarte": "voting open", "nie ma na serwerze": "not on the server", "ogłaszają się same": "announced automatically", "punktów w karierze": "career points", "✅ Zatwierdź": "✅ Approve", "z jednej drużyny ·": "from one team ·", "zostaną przepisane": "will be rewritten", "— czeka na wybór —": "— waiting for a pick —", "— wybierz serwer —": "— pick a server —", "⏹ Sezon zakończony": "⏹ Season finished", "⚠️ Za mało graczy!": "⚠️ Not enough players!", "✅ Zmieniono nazwę:": "✅ Renamed:", "✏️ Edycja składu —": "✏️ Roster edit —", "✏️ Zmiana składu —": "✏️ Roster change —", "❌ Błąd połączenia:": "❌ Connection error:", "🎖 NOWE OSIĄGNIĘCIA": "🎖 NEW ACHIEVEMENTS", "🎯 Kibice trafili —": "🎯 Fans got it right —", "🏅 Nagrody tygodnia": "🏅 Weekly awards", "🏆 Draft zakończony": "🏆 Draft complete", "💾 Zrób kopię teraz": "💾 Back up now", "📅 NAJBLIŻSZE MECZE": "📅 UPCOMING MATCHES", "📚 ARCHIWUM EVENTÓW": "📚 EVENT ARCHIVE", "📣 Rekord ogłoszony": "📣 Record announced", "📸 Potwierdź wynik:": "📸 Confirm result:", "📺 Kanał transmisji": "📺 Stream channel", "📺 Transmisja meczu": "📺 Match stream", "🔄 Resetuj drabinkę": "🔄 Reset the bracket", "🔒 Zapisy zamknięte": "🔒 Sign-ups closed", "🔗 Wyniki spotkania": "🔗 Fixture results", "🗑 Kolejka usunięta": "🗑 Round deleted", "🗓 Terminarz sezonu": "🗓 Season schedule", "+ Dodaj Zawodnika": "+ Add Player", "Domyślna godzina": "Default time", "KONTO NA STRONIE": "SITE ACCOUNT", "Rola gracza ligi": "League player role", "Start (tydzień 1": "Start (week 1", "Wszystkie sezony": "All seasons", "BILANS Z RYWALAMI": "RECORD VS OPPONENTS", "Bloki/mecz (hist.": "Blocks/game (hist.", "Brak historii H2H": "No H2H history", "DRAFT ZAKOŃCZONY!": "DRAFT COMPLETE!", "Defensywna Piątka": "Defensive Five", "Do potwierdzenia:": "To confirm:", "Dodaj rezerwowego": "Add a substitute", "Drużyna nieobecna": "Absent team", "Który nick to Ty?": "Which nick is you?", "Mecz o 3. miejsce": "3rd place game", "Nadchodzące mecze": "Upcoming matches", "Najlepsza średnia": "Best average", "Największy postęp": "Most improved", "Nowy rekord ligi!": "New league record!", "Odłącz od drużyny": "Unlink from the team", "PTS/mecz względem": "PTS/game compared to", "Rzucający obrońca": "Shooting guard", "Szukaj zawodnika…": "Search player…", "Udostępnij tabelę": "Share the table", "WSZYSTKIE DRUŻYNY": "ALL TEAMS", "Wszystkie druzyny": "All teams", "Wszystkie drużyny": "All teams", "Wszystkie kolejki": "All rounds", "Wszystkie mecze z": "All matches from", "Wyślij na Discord": "Send to Discord", "mecz o 3. miejsce": "3rd place game", "wygranych z rzędu": "wins in a row", "— brak kapitana —": "— no captain —", "— wybierz sezon —": "— pick a season —", "⏳ AI pisze wstęp…": "⏳ The AI is writing the intro…", "⚡ Pakiet tygodnia": "⚡ Weekly pack", "✅ Drużyna dodana:": "✅ Team added:", "✅ Wynik zapisany!": "✅ Result saved!", "✅ Zalogowano jako": "✅ Logged in as", "✅ Zapisano wyniki": "✅ Results saved", "❌ Błąd kopiowania": "❌ Copy error", "❌ Błąd wysyłania:": "❌ Sending error:", "⭐ Top 10 występów": "⭐ Top 10 performances", "🎮 Łącznie picków:": "🎮 Total picks:", "🎲 Losuj kapitanów": "🎲 Draw captains", "🎲 Losuj kolejność": "🎲 Draw the order", "🎲 Utwórz drabinkę": "🎲 Create the bracket", "🏆 Rekordy kariery": "🏆 Career records", "🏆 Typer playoffów": "🏆 Playoff picks", "🏳️ Dodaj Walkower": "🏳️ Add Forfeit", "📊 Czołówka tabeli": "📊 Top of the table", "📸 Zgłoś wynik: vs": "📸 Report result: vs", "🧪 Załaduj testowe": "🧪 Load test data", "🪪 Karta zawodnika": "🪪 Player card", "+ Dodaj transfer": "+ Add transfer", "Wyjątek na Week": "Exception for Week", "DO POTWIERDZENIA": "TO CONFIRM", "Dodaj do kolejki": "Add to queue", "Dodaj transmisję": "Add stream", "Historia sezonów": "Season history", "Kanał transmisji": "Stream channel", "Nagrody tygodnia": "Weekly awards", "Najbliższe mecze": "Upcoming matches", "Najlepsza jakość": "Best quality", "Niski skrzydłowy": "Small forward", "Obrońca tygodnia": "Defender of the week", "Ostatnie wyniki:": "Recent results:", "Playoff usunięty": "Playoffs deleted", "Podaj powód kary": "Enter the penalty reason", "Pokaż w tygodniu": "Show in week", "Popraw wszystkie": "Fix all", "Przypięto wyniki": "Results linked", "STATUS KAPITANÓW": "CAPTAIN STATUS", "Silny skrzydłowy": "Power forward", "Sprawdź i Zapisz": "Review and Save", "Treść wiadomości": "Message content", "Usunąć ten mecz?": "Delete this match?", "Usunąć tę akcję?": "Delete this highlight?", "Własna liczba...": "Custom number...", "ZATWIERDŹ TERMIN": "CONFIRM DATE", "Zapisać walkower": "Save forfeit", "Złodziej (5+ STL": "Thief (5+ STL", "❌ Odrzuć": "❌ Reject", "graczy ze składu": "players from the roster", "meczów w sezonie": "games this season", "mistrzem sezonu!": "season champion!", "pierwszej piątki": "starting five", "tylko w Workerze": "only in the Worker", "| Forma (ost.5):": "| Form (last 5):", "· Twoje miejsce:": "· Your place:", "— brak kolejki —": "— no round —", "— wybierz rolę —": "— pick a role —", "↩ Cofnięto pick:": "↩ Pick undone:", "⏳ Chcą dołączyć:": "⏳ Want to join:", "Ⓒ zrób kapitanem": "Ⓒ make captain", "✅ Kolejka dodana": "✅ Round added", "✅ Mecz zapisany!": "✅ Match saved!", "✅ Skład zapisany": "✅ Lineup saved", "✅ Wynik zapisany": "✅ Result saved", "✅ Zapisy otwarte": "✅ Sign-ups open", "✏️ Zmień ręcznie": "✏️ Change manually", "❌ Błąd eksportu:": "❌ Export error:", "❌ Wybierz poziom": "❌ Pick a level", "❓ Jak to działa?": "❓ How does it work?", "➡ NASTĘPNA RUNDA": "➡ NEXT ROUND", "⭐ TOP 5 WYSTĘPÓW": "⭐ TOP 5 PERFORMANCES", "🎯 Typer tygodnia": "🎯 Picker of the week", "🏀 Drużyna sezonu": "🏀 Team of the season", "🏀 Graczy w puli:": "🏀 Players in the pool:", "🏀 Twoja drużyna:": "🏀 Your team:", "🏆 Aktywne Eventy": "🏆 Active Events", "🏆 Wyloguj eventy": "🏆 Log out of events", "👍 Wspólny dzień:": "👍 Common day:", "👤 Zmień kapitana": "👤 Change captain", "💾 Ogłoś transfer": "💾 Announce transfer", "📅 Planowany mecz": "📅 Planned match", "📅 Umówione mecze": "📅 Scheduled matches", "📣 Plakat wysłany": "📣 Poster sent", "🔒 Zamknij zapisy": "🔒 Close sign-ups", "🔓 Zapisy otwarte": "🔓 Sign-ups open", "🗑 Event usunięty": "🗑 Event deleted", "🗑 Sezon usunięty": "🗑 Season deleted", "+ Zgłoś drużynę": "+ Register a team", "➕ Dodaj gracza": "➕ Add player", "Brak Worker URL": "No Worker URL", "Brak danych H2H": "No H2H data", "Brak faz eventu": "No event phases", "Brak zawodników": "No players", "Cofnięto termin": "Date undone", "Dodaj do piątki": "Add to the five", "Historia meczów": "Match history", "KOLEJKA DISCORD": "DISCORD QUEUE", "Najlepszy mecz:": "Best game:", "Odkrycie sezonu": "Breakout of the season", "Ostatnie wyniki": "Recent results", "PIERWSZA PIĄTKA": "STARTING FIVE", "PULA ZAWODNIKÓW": "PLAYER POOL", "Pakiet tygodnia": "Weekly pack", "Przechwyty (śr.": "Steals (avg.", "Przechwyty/mecz": "Steals/game", "Punkty za mecz:": "Points per game:", "Rozmiar drużyny": "Team size", "Tylko przegrane": "Losses only", "Usunąć karę dla": "Remove the penalty for", "W/L — wszystkie": "W/L — all", "Wszystkie mecze": "All matches", "Wybierz drużynę": "Pick a team", "Wybierz mecz...": "Pick a match...", "Wybierz z listy": "Pick from the list", "Własna nazwa...": "Custom name...", "Za mało drużyn!": "Not enough teams!", "Zakończyć event": "Finish the event", "Zakończyć sezon": "Finish the season", "Zastosuj aliasy": "Apply aliases", "Zobacz więcej →": "See more →", "bez dostępności": "no availability", "dołącza do ligi": "joins the league", "mecze w kolejce": "matches in the round", "meczów playoff.": "playoff matches.", "np. wymiana za…": "e.g. traded for…", "w całym sezonie": "over the whole season", "według składów?": "by roster?", "wolnych agentów": "free agents", "— bez drużyny —": "— no team —", "— karta drużyny": "— team card", "⏹ Zakończ sezon": "⏹ Finish season", "⚙ Kanał Discord": "⚙ Discord channel", "⚠ wyżej niż bot": "⚠ above the bot", "⚠️ Dane zajmują": "⚠️ The data takes up", "⚠️ słabe ogniwo": "⚠️ weak link", "✅ Nowy kapitan:": "✅ New captain:", "✅ Skład drużyny": "✅ Team roster", "✅ Zakończ draft": "✅ Finish draft", "⬇ Załaduj skład": "⬇ Load lineup", "🌐 Wszech czasów": "🌐 All-time", "🏀 Kanał wyników": "🏀 Results channel", "🏆 Tylko playoff": "🏆 Playoffs only", "🔀 Aliasy Drużyn": "🔀 Team Aliases", "🔁 Nowy transfer": "🔁 New transfer", "🔓 Otwórz zapisy": "🔓 Open sign-ups", "🗑 Logo usunięte": "🗑 Logo removed", "🗑 Mecz usunięty": "🗑 Match deleted", "Format sezonu": "Season format", "Akcja tygodnia": "Highlight of the week", "Aktywny sezon:": "Active season:", "Brak drabinki.": "No bracket.", "DNI NA STRONIE": "DAYS ON SITE", "DRUŻYNA / ROLA": "TEAM / ROLE", "Drużyna sezonu": "Team of the season", "Główna pozycja": "Main position", "KOLEJKA PICKÓW": "PICK QUEUE", "Kanał usunięty": "Channel removed", "Logujesz się z": "You're logging in from", "Nick kapitana…": "Captain's nick…", "OSTATNIE MECZE": "RECENT MATCHES", "Obrońca sezonu": "Defender of the season", "Obrońca tytułu": "Defending champion", "Usunąć drużynę": "Delete the team", "bez transmisji": "no stream", "meczów · start": "matches · start", "np. 2. Kolejka": "e.g. Round 2", "wyżej = lepiej": "higher = better", "z każdej grupy": "from each group", "z pola łącznie": "field goals total", "· wspólne okno": "· common window", "— Karta gracza": "— Player card", "— bez sezonu —": "— no season —", "↩ Cofnij wynik": "↩ Undo result", "↩ Zmień termin": "↩ Change date", "⏳ Nadaję role…": "⏳ Assigning roles…", "⏳ Wysyłanie...": "⏳ Sending...", "⚡ Ranking siły": "⚡ Power rating", "✅ DO ZROBIENIA": "✅ TO DO", "✅ Gracz dodany": "✅ Player added", "✅ Utwórz event": "✅ Create event", "✅ ZATWIERDZONA": "✅ APPROVED", "✅ Zatwierdzona": "✅ Approved", "✏️ Edytuj mecz": "✏️ Edit match", "✕ Zakończ demo": "✕ End demo", "❌ Błąd zapisu:": "❌ Save error:", "❌ Wybierz datę": "❌ Pick a date", "🆓 Wolni agenci": "🆓 Free agents", "🌱 Początkujący": "🌱 Beginner", "🎯 Typer sezonu": "🎯 Season picks", "🏆 Eventy admin": "🏆 Events admin", "🏆 REKORDY LIGI": "🏆 LEAGUE RECORDS", "🏆 Rekordy ligi": "🏆 League records", "📅 Tylko ligowe": "📅 League only", "📈 Forma Drużyn": "📈 Team Form", "📈 Ranking siły": "📈 Power rating", "📜 Kronika ligi": "📜 League chronicle", "🔄 Nazwy drużyn": "🔄 Team names", "🔐 Hasło draftu": "🔐 Draft password", "🖼 Plakat meczu": "🖼 Match poster", "🛡️ Śr. tracone": "🛡️ Avg. allowed", "** → kapitan:": "** → captain:", "10 zawodników": "10 players", "Obecny skład": "Current roster", "🖼 Zmień logo": "🖼 Change logo", "🪪 Moja karta": "🪪 My card", "Aktywni 7 dni": "Active 7 days", "Brak eventów.": "No events.", "Brak kapitana": "No captain", "Brak wydarzeń": "No events", "Doświadczenie": "Experience", "Gala sezonu —": "Season gala —", "Hasło dostępu": "Access password", "KW5 (oryginał": "KW5 (original", "Każdy gra sam": "Everyone plays solo", "Liczba drużyn": "Number of teams", "MISTRZ SEZONU": "SEASON CHAMPION", "Mecz tygodnia": "Game of the week", "Nazwa drużyny": "Team name", "Nazwa kolejki": "Round name", "Nie rozegrany": "Not played", "Przywróć auto": "Restore auto", "Punkty za mln": "Points per million", "Rola kapitana": "Captain role", "Twoja drużyna": "Your team", "Tylko wygrane": "Wins only", "Ustaw aktywną": "Set active", "Usunięto karę": "Penalty removed", "Usunięto mecz": "Match deleted", "Usunąć event?": "Delete the event?", "Usuń z składu": "Remove from roster", "WAŻNE ZASADY:": "IMPORTANT RULES:", "Widzisz jako:": "Viewing as:", "Wyniki Meczów": "Match Results", "Zalecane przy": "Recommended for", "Zapisy drużyn": "Team sign-ups", "Zgłoś drużynę": "Register a team", "do rozegrania": "left to play", "mecze czekają": "matches waiting", "na Discordzie": "on Discord", "nieznany błąd": "unknown error", "sprawdź wynik": "check the result", "w tej edycji.": "in this edition.", "wygrywa serię": "wins the series", "z piątki) ×2.": "from the five) ×2.", "⏳ Łączenie...": "⏳ Merging...", "✏️ Zmień typy": "✏️ Change picks", "❌ Brak graczy": "❌ No players", "❌ Błąd sieci:": "❌ Network error:", "❌ Błąd zapisu": "❌ Save error", "❌ Podaj hasło": "❌ Enter the password", "❌ Tylko admin": "❌ Admin only", "🎖 OSIĄGNIĘCIA": "🎖 ACHIEVEMENTS", "🎖 Osiągnięcia": "🎖 Achievements", "🎲 Losuj grupy": "🎲 Draw groups", "🏆 Gala sezonu": "🏆 Season gala", "🏟 Jedna grupa": "🏟 One group", "👤 Użytkownicy": "👤 Users", "📅 Harmonogram": "📅 Schedule", "📝 RECAP MECZU": "📝 MATCH RECAP", "📝 Recap meczu": "📝 Match recap", "🗳 Głosowanie:": "🗳 Voting:", "🧪 Wyślij test": "🧪 Send test", "+ Dodaj Mecz": "+ Add Match", "+ Nowy Event": "+ New Event", "+ Nowy sezon": "+ New season", "3 zawodników": "3 players", "4 zawodników": "4 players", "5 zawodników": "5 players", "6 zawodników": "6 players", "7 zawodników": "7 players", "8 zawodników": "8 players", "9 zawodników": "9 players", "NICK W GRZE": "IN-GAME NICK", "Akcja sezonu": "Highlight of the season", "Analizuję...": "Analyzing...", "Brak kolejek": "No rounds", "Błędna nazwa": "Wrong name", "Czas na pick": "Pick time", "Dodajesz do:": "Adding to:", "Drużyna 1...": "Team 1...", "Drużyna 2...": "Team 2...", "H2H (sezon):": "H2H (season):", "Kronika ligi": "League chronicle", "Logo drużyny": "Team logo", "MVP tygodnia": "MVP of the week", "Nagrody Week": "Awards Week", "Ocena składu": "Lineup rating", "Osiągnięcie:": "Achievement:", "Ostatni mecz": "Last game", "Ostatni pick": "Last pick", "Plakat meczu": "Match poster", "Pokaż więcej": "Show more", "Poniedziałek": "Monday", "Punkty karne": "Penalty points", "Rozgrywający": "Point guard", "Rozwiązanie:": "Solution:", "Twój mistrz:": "Your champion:", "Usunąć sezon": "Delete the season", "Zbiórki (śr.": "Rebounds (avg.", "Zbiórki/mecz": "Rebounds/game", "i skład grup": "and group lineup", "meczów czeka": "matches waiting", "niepołączony": "not linked", "niezgodności": "mismatches", "za 3 łącznie": "3PT total", "Ćwierćfinały": "Quarterfinals", "Ładowanie...": "Loading...", "łącznie TOPG": "total TOPG", "ℹ️ Szczegóły": "ℹ️ Details", "Ⓒ KAPITAN ×2": "Ⓒ CAPTAIN ×2", "✅ Połączono!": "✅ Connected!", "❌ Podaj datę": "❌ Enter a date", "➕ Dodaj karę": "➕ Add penalty", "🏆 MVP Sezonu": "🏆 Season MVP", "🏆 NOWY EVENT": "🏆 NEW EVENT", "🏆 Zakończony": "🏆 Finished", "📊 Statystyki": "📊 Stats", "📊 Śr. punkty": "📊 Avg. points", "📋 Zgłoszenia": "📋 Registrations", "🔄 Nowy wstęp": "🔄 New intro", "🔗 Powiązania": "🔗 Links", "🖼 Nowe logo:": "🖼 New logo:", "Cały sezon": "Whole season", "Do drużyny": "To team", "↩ Przywróć": "↩ Restore", "AST na mecz": "AST per game", "Asysty (śr.": "Assists (avg.", "Asysty/mecz": "Assists/game", "Bez drużyny": "No team", "Brak danych": "No data", "Brak drużyn": "No teams", "Brak głosów": "No votes", "Brak meczów": "No matches", "Brak wpisów": "No entries", "Brak zmian.": "No changes.", "Dodano mecz": "Match added", "Na drużynę:": "Per team:", "Nick gracza": "Player nick", "PKT różnicy": "PT margin", "Potwierdzić": "Confirm", "Punkty (śr.": "Points (avg.", "Rola gracza": "Player role", "Straty (śr.": "Turnovers (avg.", "TEN TYDZIEŃ": "THIS WEEK", "Wszystkie →": "All →", "Zaloguj się": "Log in", "Zgłoś wynik": "Report result", "Zmień skład": "Change roster", "brak danych": "no data", "brak rzutów": "no shots", "jedna grupa": "one group", "na Twój typ": "for your pick", "nazw graczy": "player names", "nie w lidze": "not in the league", "pkt łącznie": "pts total", "skład pełny": "lineup full", "ten tydzień": "this week", "załadowany!": "loaded!", "Łączenie...": "Merging...", "łącznie APG": "total APG", "łącznie BPG": "total BPG", "łącznie RPG": "total RPG", "łącznie SPG": "total SPG", "— wybierz —": "— choose —", "— zwycięzcy": "— winners", "← Mój skład": "← My lineup", "⏳ Czeka na:": "⏳ Waiting for:", "⏳ Wczytuję…": "⏳ Loading…", "✅ Zapisano!": "✅ Saved!", "✅ Zapisano:": "✅ Saved:", "🏆 Zwycięzca": "🏆 Winner", "👤 Mój panel": "👤 My panel", "📊 MÓJ SEZON": "📊 MY SEASON", "📣 Ogłoszone": "📣 Announced", "🔁 Transfery": "🔁 Transfers", "🗑 Usunięto:": "🗑 Deleted:", "🗳 Zagłosuj:": "🗳 Vote:", "🧢 KAPITAN ·": "🧢 CAPTAIN ·", "🧩 Mój skład": "🧩 My lineup", "**Powód:**": "**Reason:**", "+ Zawodnik": "+ Player", "1. Kolejka": "Round 1", "1000/dzień": "1000/day", "Z drużyny": "From team", "▶ Odtwórz": "▶ Play", "Bez sezonu": "No season", "Bloki (śr.": "Blocks (avg.", "Bloki/mecz": "Blocks/game", "Brak kopii": "No backups", "Błąd sieci": "Network error", "Cała liga:": "Whole league:", "Co zrobić?": "What to do?", "Data Meczu": "Match Date", "Data meczu": "Match date", "Dodaj Mecz": "Add Match", "Dodaj fazę": "Add phase", "GRACZ (PSN": "PLAYER (PSN", "Jako admin": "As admin", "Jeden mecz": "One game", "MVP sezonu": "Season MVP", "Ręczny OVR": "Manual OVR", "Sezon DEMO": "DEMO season", "Statystyki": "Stats", "Typ eventu": "Event type", "Udostępnij": "Share", "UŻYTKOWNIK": "USER", "ZAKOŃCZONY": "FINISHED", "Zamienić „": "Replace “", "Zawodnik 1": "Player 1", "Zawodnik 2": "Player 2", "bez limitu": "no limit", "bez meczów": "no games", "brak meczu": "no match", "do eventu.": "to the event.", "drużynach.": "teams.", "i następny": "and the next", "mecz czeka": "match waiting", "na drużynę": "per team", "spotkań Bo": "fixtures Bo", "w składzie": "in the lineup", "zamyka się": "locks", "zawodników": "players", "| obrońca:": "| defender:", "· 🎯 typer:": "· 🎯 picks:", "— pominą —": "— skip —", "” jest już": "” is already", "⏳ OCZEKUJE": "⏳ PENDING", "⚡ Porównaj": "⚡ Compare", "✅ Zapisano": "✅ Saved", "✅ Zapisany": "✅ Saved", "✓ Zapisano": "✓ Saved", "✓ Zapisany": "✓ Saved", "🌐 Wszystko": "🌐 Everything", "👤 Kapitan:": "👤 Captain:", "👥 DOSTĘPNI": "👥 AVAILABLE", "👥 Drużyny:": "👥 Teams:", "💤 Pauzuje:": "💤 Bye:", "📺 Zapisano": "📺 Saved", "🔔 Wysłano:": "🔔 Sent:", "🗑 Usunięto": "🗑 Deleted", "/zawodnik": "/player", "1. Piątka": "1st Five", "2. Piątka": "2nd Five", "2 drużyny": "2 teams", "3 drużyny": "3 teams", "4 drużyny": "4 teams", "Zawodnik": "Player", "✅ Połącz": "✅ Link", "✅ Zapisz": "✅ Save", "💾 Zapisz": "💾 Save", "📤 Wyślij": "📤 Send", "🔗 Połącz": "🔗 Link", "Cała liga": "Whole league", "Drużyna 1": "Team 1", "Drużyna 2": "Team 2", "Drużyna A": "Team A", "Drużyna B": "Team B", "Drużyna C": "Team C", "Drużyna D": "Team D", "Drużyna E": "Team E", "Drużyna F": "Team F", "Drużyna G": "Team G", "Drużyna H": "Team H", "L z rzędu": "L in a row", "MVP MECZU": "GAME MVP", "MÓJ SKŁAD": "MY LINEUP", "Mój panel": "My panel", "Najdrożsi": "Most expensive", "POŁĄCZENI": "LINKED", "Półfinały": "Semifinals", "Rozegrane": "Played", "Szukaj...": "Search...", "Tak, usuń": "Yes, delete", "Usuń mecz": "Delete match", "W z rzędu": "W in a row", "Wszystkie": "All", "ZATWIERDŹ": "APPROVE", "rolę bota": "the bot's role", "spotkań =": "fixtures =", "wcześniej": "earlier", "wspólnych": "shared", "zamknięte": "closed", "· Kolejka": "· Round", "· ostatni": "· last", "— gotowe!": "— done!", "⏳ Rysuję…": "⏳ Drawing…", "✅ Drużyny": "✅ Teams", "✅ Gotowe:": "✅ Done:", "✕ Wyczyść": "✕ Clear", "🏀 DRUŻYNY": "🏀 TEAMS", "🏀 Drużyny": "🏀 Teams", "🏀 Kapitan": "🏀 Captain", "🏀 Zbiórki": "🏀 Rebounds", "🏅 Nagrody": "🏅 Awards", "🏆 Ranking": "🏆 Ranking", "🏆 Rekordy": "🏆 Records", "🏛 Rekordy": "🏛 Records", "📥 Załaduj": "📥 Load", "🔄 Odśwież": "🔄 Refresh", "🔑 Odśwież": "🔑 Refresh", "🔓 Wyloguj": "🔓 Log out", "🔴 NA ŻYWO": "🔴 LIVE", "🥈 Finał ·": "🥈 Final ·", "🧢 KAPITAN": "🧢 CAPTAIN", "🧢 kapitan": "🧢 captain", "🧪 Sprawdź": "🧪 Check", "5 drużyn": "5 teams", "6 drużyn": "6 teams", "7 drużyn": "7 teams", "8 drużyn": "8 teams", "+ Dodaj": "+ Add", "Drużyna": "Team", "Drużyny": "Teams", "➕ Dodaj": "➕ Add", "DOSTĘPNI": "AVAILABLE", "KB) dla:": "KB) for:", "Kapitan:": "Captain:", "Najtańsi": "Cheapest", "Odrzucić": "Reject", "PRZYWRÓĆ": "RESTORE", "Połączyć": "Merge", "Pudła/GP": "Misses/GP", "Skład na": "Lineup for", "Twój typ": "Your pick", "Usunięto": "Deleted", "Wejdź na": "Go to", "Wynik D1": "Score T1", "Wynik D2": "Score T2", "dni temu": "days ago", "drużyn ·": "teams ·", "graczy w": "players in", "i zapisz": "and save", "nie grał": "didn't play", "osiągnął": "achieved", "pkt/mecz": "pts/game", "za drogi": "too expensive", "Środkowy": "Center", "— brak —": "— none —", "▮▮ Pauza": "▮▮ Pause", "⚙ Aliasy": "⚙ Aliases", "✗ anuluj": "✗ cancel", "🏀 Wyniki": "🏀 Results", "🏆 Eventy": "🏆 Events", "📣 Wyślij": "📣 Send", "🔗 Wyniki": "🔗 Results", "Zamień": "Replace", "🗑 Usuń": "🗑 Delete", "Bieżący": "Current", "DRUŻYNA": "TEAM", "Data do": "Date to", "Data od": "Date from", "KOLEJKA": "ROUND", "Kapitan": "Captain", "Kolejka": "Round", "NA ŻYWO": "LIVE", "Rekordy": "Records", "Sprawdź": "Check", "Tydzień": "Week", "Wybierz": "Choose", "Wyczyść": "Clear", "Zaloguj": "Log in", "Zamknij": "Close", "drużyny": "teams", "eventów": "events", "graczy:": "players:", "kapitan": "captain", "mecze ·": "matches ·", "meczów!": "matches!", "meczów.": "matches.", "meczów:": "matches:", "pkt FG:": "pts FG:", "porażek": "losses", "różnica": "difference", "spotkań": "fixtures", "wysłane": "sent", "wysłano": "sent", "zgłosił": "submitted", "zostało": "left", "· finał": "· final", "· skład": "· lineup", "✅ Sezon": "✅ Season", "❌ Błąd:": "❌ Error:", "🏀 Mecze": "🏀 Matches", "🏆 Sezon": "🏆 Season", "👤 Kibic": "👤 Fan", "👥 Grupy": "👥 Groups", "📋 MECZE": "📋 MATCHES", "1 mecz": "1 match", "Sezon": "Season", "Aliasy": "Aliases", "Anuluj": "Cancel", "BUDŻET": "BUDGET", "Pokaż:": "Show:", "Powód:": "Reason:", "Sezon:": "Season:", "Skład:": "Roster:", "Usunąć": "Delete", "W górę": "Up", "Więcej": "More", "Zapisz": "Save", "budżet": "budget", "drużyn": "teams", "głosów": "votes", "meczów": "matches", "trójek": "threes", "trójka": "three", "trójki": "threes", "wynik:": "score:", "· mecz": "· game", "” na „": "” with “", "▶ Mecz": "▶ Game", "⚙ Baza": "⚙ Database", "✕ Usuń": "✕ Delete", "❌ Błąd": "❌ Error", "🔄 Nowy": "🔄 New", ": śr.": ": avg.", "Usuń": "Delete", "Błąd:": "Error:", "Dodaj": "Add", "Finał": "Final", "Gracz": "Player", "Grupa": "Group", "Hasło": "Password", "MECZ:": "GAME:", "Mecze": "Matches", "SKŁAD": "LINEUP", "Skład": "Lineup", "W dół": "Down", "Wynik": "Score", "dodał": "added", "gracz": "player", "głosy": "votes", "mecze": "matches", "Środa": "Wednesday", "Brak": "None", "Błąd": "Error", "DZIŚ": "TODAY", "Mecz": "Match", "dziś": "today", "głos": "vote", "mecz": "match", "pkt": "pts", "śr.": "avg.", "Śr": "Wed", "🕐 od": "🕐 from", "już": "already", "Pn": "Mon", "Wt": "Tue", "Cz": "Thu", "Pt": "Fri", "Nd": "Sun", "Wtorek": "Tuesday", "Czwartek": "Thursday", "Piątek": "Friday", "Sobota": "Saturday", "Niedziela": "Sunday", "poniedziałek": "Monday", "wtorek": "Tuesday", "środa": "Wednesday", "czwartek": "Thursday", "piątek": "Friday", "sobota": "Saturday", "niedziela": "Sunday", "Wyloguj": "Log out", "Harmonogram": "Schedule", "Eventy": "Events", "Start": "Home", "Terminarz": "Schedule", "Motyw": "Theme", "Discord ligi": "League Discord", "Wygrane": "Wins", "Porażki": "Losses", "Zwycięstwa": "Wins", "Punkty": "Points", "Zbiórki": "Rebounds", "Asysty": "Assists", "Przechwyty": "Steals", "Bloki": "Blocks", "Straty": "Turnovers", "Mecze rozegrane": "Games played", "Tabela": "Standings", "Rynek": "Market", "Ranking": "Ranking", "Zasady": "Rules", "📖 Zasady": "📖 Rules", "💰 Rynek": "💰 Market", "SEZON": "SEASON", "Trwa": "In progress:", "debiutant": "newcomer", "w sezonie": "this season", "ostatni": "last", "mln": "M", "Rezerwowi": "Substitutes", "REZERWOWI": "SUBSTITUTES", "1. zmiennik": "1st sub", "2. zmiennik": "2nd sub", "💾 Zapisz skład": "💾 Save lineup", "↩ Cofnij zmiany": "↩ Undo changes", "zapis obowiązuje od Week": "saving applies from Week", "Trwa ": "In progress ", "Kto wygra?": "Who wins?", "prognoza": "prediction", "Transmisja": "Stream", "Akcje": "Highlights", "AKCJE": "HIGHLIGHTS", "TRANSMISJA": "STREAM", "Propozycje terminu": "Date proposals", "Priorytet": "Priority", "Zapas": "Backup", "Inny": "Other", "Zapisz wybór": "Save choice", "Czeka na:": "Waiting for:", "Termin do ustalenia": "Date to be set", "Umówione mecze": "Scheduled matches", "Wyniki": "Results", "Zapisy do ligi": "League sign-ups", "Wolni agenci": "Free agents", "Transfery": "Transfers", "Zgłoś się jako wolny agent": "Sign up as a free agent", "Pozycja": "Position", "POZYCJA": "POSITION", "Ranking siły": "Power rating", "Historia mistrzów": "Champions history", "Wykres": "Chart", "Do zrobienia": "To do", "DO ZROBIENIA": "TO DO", "NAJBLIŻSZE MECZE": "UPCOMING MATCHES", "Gracze": "Players", "Zawodnicy": "Players", "Kapitanowie": "Captains", "tydzień": "week", "tygodnie": "weeks", "tygodni": "weeks", "dzień": "day", "dni": "days", "godz.": "h", "meczu": "match", "graczy": "players", "gracza": "player", "zawodnik": "player", "zawodnika": "player", "drużyna": "team", "punkt": "point", "punkty": "points", "punktów": "points", "zbiórki": "rebounds", "asysty": "assists", "wygrana": "win", "wygranych": "wins", "przegrana": "loss", "porażka": "loss", "remis": "draw", "remisy": "draws", "Zwycięzca": "Winner", "Półfinał": "Semifinal", "Ćwierćfinał": "Quarterfinal", "sezon": "season", "sezonu": "season", "kolejka": "round", "kolejki": "round", "Edytuj": "Edit", "Wyślij": "Send", "Pokaż": "Show", "Ukryj": "Hide", "Szukaj": "Search", "Filtruj": "Filter", "Sortuj": "Sort", "Gotowe": "Done", "Ładowanie": "Loading", "brak": "none", "Pierwsza piątka": "Starting five", "Wszystko": "Everything", "Opcjonalnie": "Optional", "Pon": "Mon", "Wto": "Tue", "Śro": "Wed", "Czw": "Thu", "Pią": "Fri", "Sob": "Sat", "Nie.": "Sun.", "Wybierz termin": "Pick a date", "Akceptuj": "Accept", "Odrzuć": "Reject", "Potwierdź": "Confirm", "Śsyń drużynę": "Delete team", "Usuń drużynę": "Delete team", "Discord Polskiej Ligi": "Polish League Discord", "Zostaw puste aby użyć domyślnej wiadomości…": "Leave empty to use the default message…", "🎭 Role Discord": "🎭 Discord roles", "Role Discord": "Discord roles", "📝 Dziennik zmian": "📝 Change log", "Dziennik zmian": "Change log", "⚖️ Kary": "⚖️ Penalties", "Kary": "Penalties", "Ostatnie 5": "Last 5", "🏳 Walkower": "🏳 Forfeit", "Walkower": "Forfeit", "walkower": "forfeit", "Poprawna nazwa": "Correct name", "⚙ Generuj terminarz": "⚙ Generate schedule", "Generuj terminarz": "Generate schedule", "🔔 Przypomnij kapitanom": "🔔 Remind captains", "📰 Podsumowanie": "📰 Summary", "Podsumowanie": "Summary", "📆 Kalendarz": "📆 Calendar", "Kalendarz": "Calendar", "📚 Archiwum": "📚 Archive", "Archiwum": "Archive", "🤖 Analizuj Screenshot": "🤖 Analyze Screenshot", "Analizuj Screenshot": "Analyze Screenshot", "Data": "Date", "Notatka (opcjonalnie)": "Note (optional)", "EDYCJA:": "EDITION:", "Link webhooka": "Webhook link", "Serwer": "Server", "💾 Kopie zapasowe": "💾 Backups", "Kopie zapasowe": "Backups", "KAPITAN": "CAPTAIN", "🔗 Połączonych:": "🔗 Linked:", "Połączonych:": "Linked:", "📋 Kopiuj zaproszenie dla graczy": "📋 Copy invite for players", "Kopiuj zaproszenie": "Copy invite", "OFICJALNA PLATFORMA LIGOWA": "OFFICIAL LEAGUE PLATFORM", "Oficjalna platforma ligowa": "Official league platform", "KLASYFIKACJA GENERALNA": "OVERALL STANDINGS", "Klasyfikacja generalna": "Overall standings", "TY ·": "YOU ·", "🏀 TY ·": "🏀 YOU ·", "czeka na Twój typ": "waiting for your pick", "czekają na Twój typ": "waiting for your pick", "🧢 Jako kapitan jesteś połączony z": "🧢 As captain you're linked to", "Jako kapitan jesteś połączony z": "As captain you're linked to", "jako": "as", "czeka": "waiting", "czekają": "waiting", "oraz": "and", "albo": "or", "lub": "or", "przez": "by", "bez": "without", "Status:": "Status:", "Wyniki meczów": "Match results", "Tabela ligowa": "League table", "TABELA": "TABLE", "Liderzy": "Leaders", "LIDERZY": "LEADERS", "Forma": "Form", "FORMA": "FORM", "Bilans": "Record", "BILANS": "RECORD", "Pkt": "Pts", "PKT": "PTS", "Różnica": "Diff", "Aktualności": "News", "Ogłoszenia": "Announcements", "Regulamin": "Rules", "regulamin": "rules", "Typer": "Picks", "Typ": "Pick", "Typy": "Picks", "Nagrody": "Awards", "Głosowanie": "Voting", "Zagłosuj": "Vote", "Zgłoszenia": "Registrations", "Zatwierdź": "Approve", "Zatwierdzona": "Approved", "Oczekuje": "Pending", "Odrzucona": "Rejected", "Obserwuj": "Follow", "Obserwowani": "Followed", "Porównaj": "Compare", "Profil": "Profile", "Karta": "Card", "Pobierz": "Download", "Kopiuj": "Copy", "Skopiowano": "Copied", "Odśwież": "Refresh", "Wczoraj": "Yesterday", "Dzisiaj": "Today", "Jutro": "Tomorrow", "dzisiaj": "today", "jutro": "tomorrow", "wczoraj": "yesterday", "Zakończony": "Finished", "W trakcie": "In progress", "Nadchodzący": "Upcoming", "Otwarte": "Open", "Zamknięte": "Closed", "· za": "· in", "(Ty)": "(You)", " (Ty)": " (You)", "godz. temu": "h ago", "min temu": "min ago", "przed chwilą": "just now", "📊 MOJE STATYSTYKI": "📊 MY STATS", "📊 MOJE STATYSTYKI —": "📊 MY STATS —", "👥 MOJA DRUŻYNA —": "👥 MY TEAM —", "MECZE": "GAMES", "OCENA": "GRADE", "🔥 Najlepszy mecz:": "🔥 Best game:", "strzelec drużyny": "scorer on the team", "📋 Pełny profil": "📋 Full profile", "Pełny profil": "Full profile", "Kariera": "Career", "Edycja": "Edition", "ZAWODNIK": "PLAYER", "Średnie na mecz · kliknij zawodnika, żeby zobaczyć jego profil.": "Per-game averages · click a player to see their profile.", "Brak meczów jako": "No games as", "w tym zakresie.": "in this range.", "Wybierz swój nick ze składu (niżej), żeby zobaczyć swoje statystyki.": "Pick your nick from the roster (below) to see your stats.", "👥 Drużyny": "👥 Teams", "👥 Drużyny i składy": "👥 Teams and rosters", "🏀 Drużyny i składy": "🏀 Teams and rosters", "Drużyny i składy": "Teams and rosters", "Szukaj drużyny albo zawodnika…": "Search for a team or player…", "Wg bilansu": "By record", "Wg rankingu siły": "By power rating", "Alfabetycznie": "Alphabetically", "Statystyki: ten sezon": "Stats: this season", "Statystyki: cała historia": "Stats: all-time", "Statystyki:": "Stats:", "📺 kanał": "📺 channel", "POZ": "POS", "spoza składu": "off roster", "📊 Statystyki drużyny": "📊 Team stats", "Nic nie znaleziono.": "Nothing found.", "Brak zatwierdzonych drużyn w tym sezonie.": "No approved teams this season.", "Średnie na mecz · kliknij drużynę albo zawodnika, żeby zobaczyć pełne statystyki.": "Per-game averages · click a team or player to see full stats.", "każda": "any", "🔀 Ułóż na pozycjach": "🔀 Arrange by position", "PIERWSZA PIĄTKA · PG · SG · SF · PF · C": "STARTING FIVE · PG · SG · SF · PF · C", "nie gra na": "doesn't play", "piątki na pozycję": "the five at position", "Uzupełnij piątkę (PG, SG, SF, PF, C) + 2 rezerwowych": "Fill the five (PG, SG, SF, PF, C) + 2 subs", "Zawodnicy nie pasują do pozycji:": "Players don't fit the positions:", "— użyj „🔀 Ułóż na pozycjach”": "— use “🔀 Arrange by position”", "🔀 Ułożono zawodników na pozycjach": "🔀 Players arranged by position", "Nie da się ułożyć tej piątki na pozycjach PG/SG/SF/PF/C — wymień kogoś": "This five can't be arranged as PG/SG/SF/PF/C — swap someone", "Brak wolnego miejsca na tej pozycji — kliknij puste miejsce albo usuń kogoś": "No free spot at this position — click an empty slot or remove someone", "piątka po pozycjach —": "a positional five —", "— + 2 rezerwowych (dowolne pozycje) ·": "— + 2 subs (any position) ·", "zawodnika = pozycje, na których grał w min. 25% ostatnich 20 meczów (np. SG/SF). Debiutant bez danych pasuje wszędzie.": "of a player = positions played in at least 25% of the last 20 games (e.g. SG/SF). A newcomer with no data fits anywhere.", "📨 Przypomnij o pozycjach": "📨 Remind about positions", "🏀 Fantasy: ułóż piątkę po pozycjach (PG, SG, SF, PF, C)": "🏀 Fantasy: arrange your five by position (PG, SG, SF, PF, C)", "✅ Wszystkie zapisane składy pasują do pozycji": "✅ All saved lineups fit the positions", "Składy niepasujące do pozycji:": "Lineups not fitting positions:", "Wysłać im prywatną wiadomość na Discordzie?": "Send them a private message on Discord?", "📨 Wysłano:": "📨 Sent:", "nie doszło:": "not delivered:", "(zamknięte DM)": "(DMs closed)", "⏳ Wysyłam…": "⏳ Sending…", "Zmiana zasad — ułóż skład na nowo.": "Rules changed — rebuild your lineup.", "Pierwsza piątka jest teraz po pozycjach (PG, SG, SF, PF, C), a pozycje zawodników liczą się z meczów w NBA 2K27.": "The starting five is now positional (PG, SG, SF, PF, C), and player positions come from NBA 2K27 games.", "Skład zapisany przed zmianą": "A lineup saved before the change", "nie zdobywa punktów": "doesn't score points", "— ułóż piątkę (możesz użyć „🔀 Ułóż na pozycjach”) i kliknij": "— arrange your five (you can use “🔀 Arrange by position”) and click", "Skład sprzed zmiany zasad — nie punktuje": "Lineup from before the rule change — doesn't score", "🤝 Remis 1:1": "🤝 Draw 1:1", "🤝 Remis 1:1 · Twój typ": "🤝 Draw 1:1 · Your pick", "🤝 Remis 2:2": "🤝 Draw 2:2", "Typuję remis 1:1": "I pick a 1:1 draw", "· 🤝 remis": "· 🤝 draw", "🤝 Remis — nikt go nie typował": "🤝 Draw — nobody picked it", "🤝 Kibice byli podzieleni": "🤝 Fans were split", "🎯 Remis! Kibice trafili —": "🎯 Draw! Fans got it right —", "% typowało remis": "% picked a draw", "🤝 Remis — typowało go": "🤝 Draw — picked by", "% kibiców": "% of fans", "1 pkt za trafiony wynik spotkania · przy Bo2 możesz typować też remis 1:1 (🤝) · typujesz przyciskiem 👍 przy meczu": "1 pt for the correct fixture outcome · with Bo2 you can also pick a 1:1 draw (🤝) · pick with the 👍 button at the match", "Remis możliwy tylko przy parzystej liczbie meczów (np. Bo2)": "A draw is only possible with an even number of games (e.g. Bo2)", "W Week 2 Twój skład punktuje jeszcze normalnie, ale": "In Week 2 your lineup still scores normally, but", "od Week 3 skład sprzed zmiany nie zdobywa punktów": "from Week 3 a lineup from before the change doesn't score", "przed poniedziałkiem 00:00.": "before Monday 00:00.", "Komentuj": "Comment", "Brak komentarzy — napisz pierwszy": "No comments — be the first", "Napisz komentarz…": "Write a comment…", "Zaloguj się przez Discord, żeby komentować": "Log in with Discord to comment", "Usunąć komentarz?": "Delete the comment?", "⚔️ H2H": "⚔️ H2H", "⚔️ Rywalizacja": "⚔️ Rivalry", "🔥 Klasyk": "🔥 Classic", "· 🔥 Klasyk": "· 🔥 Classic", "⚔️ Historia starć": "⚔️ Head-to-head history", "🔥 Seria:": "🔥 Streak:", "z rzędu": "in a row", "💥 Najwyższa wygrana:": "💥 Biggest win:", "📅 Wg edycji:": "📅 By edition:", "⭐ NAJLEPSI W TYCH STARCIACH (PTS/MECZ)": "⭐ TOP PERFORMERS IN THESE GAMES (PTS/GAME)", "OSTATNIE STARCIA": "RECENT GAMES", "rekord": "record", "jeszcze się nie spotkali. To będzie pierwsze starcie! ⚔️": "haven't met yet. This will be the first clash! ⚔️", "🔮 TYPY PRZEDSEZONOWE": "🔮 PRE-SEASON PREDICTIONS", "Mistrz sezonu": "Season champion", "Debiutant roku": "Rookie of the year", "Król strzelców": "Top scorer", "Ostatnie miejsce": "Last place", "% kibiców typuje to samo": "% of fans picked the same", "💾 Zapisz typy": "💾 Save predictions", "Typy innych zobaczysz po zamknięciu. Rozliczenie na koniec sezonu.": "You'll see others' picks after the lock. Settled at the end of the season.", "Zaloguj się przez Discord, żeby wytypować mistrza, MVP i resztę.": "Log in with Discord to predict the champion, MVP and more.", "✅ rozliczone": "✅ settled", "🔒 zamknięte": "🔒 closed", "brak typów": "no picks", "Twój typ:": "Your pick:", "osoba": "person", "osoby": "people", "osób": "people", "⚙ Admin: termin i rozliczenie": "⚙ Admin: deadline and settlement", "Zamknięcie typów:": "Predictions lock:", "Zapisz termin": "Save deadline", "(domyślnie start Week 1 — dla trwającego sezonu ustaw późniejszy)": "(default: start of Week 1 — set a later date for a season in progress)", "🏁 Rozlicz typy": "🏁 Settle predictions", "Cofnij rozliczenie": "Undo settlement", "🔮 Typy zapisane — powodzenia!": "🔮 Predictions saved — good luck!", "Rozliczyć typy przedsezonowe tymi wynikami?": "Settle pre-season predictions with these results?", "🔮 Oddaj typy przedsezonowe (mistrz, MVP, debiutant…)": "🔮 Make your pre-season predictions (champion, MVP, rookie…)", "🎁 Wrapped —": "🎁 Wrapped —", "🎁 Mój Wrapped": "🎁 My Wrapped", "Mój Wrapped": "My Wrapped", "🏀 Jako gracz": "🏀 As a player", "👀 Jako kibic": "👀 As a fan", "PUNKTÓW": "POINTS", "na mecz": "per game", "W LIDZE (PTS)": "IN LEAGUE (PTS)", "Średnio": "Average", "Ulubiona ofiara:": "Favorite victim:", "Największy rywal:": "Biggest rival:", "Najdłuższa seria:": "Longest streak:", "SKUTECZNOŚĆ TYPÓW": "PICK ACCURACY", "W TYPERZE": "IN PICKS", "PKT FANTASY": "FANTASY PTS", "bez składu": "no lineup", "Trafione niespodzianki:": "Upsets called:", "— typowałeś, gdy większość myślała inaczej": "— you picked against the majority", "Najlepsza kolejka fantasy:": "Best fantasy round:", "Twój typ na mistrza:": "Your champion pick:", "Głosowałeś w": "You voted in", "na nagrody": "for awards", "Polubione akcje:": "Liked highlights:", "Jeszcze nic tu nie ma — typuj mecze, zbuduj skład w Fantasy i głosuj na nagrody, a Twój Wrapped się zapełni!": "Nothing here yet — pick matches, build a Fantasy lineup and vote for awards to fill your Wrapped!", "Zaloguj się przez Discord, żeby zobaczyć swój Wrapped.": "Log in with Discord to see your Wrapped.", "🪪 Pobierz kartę do udostępnienia": "🪪 Download a shareable card", "🪪 Karta pobrana — wrzuć ją na Discorda!": "🪪 Card downloaded — post it on Discord!", "osiągnięcie": "achievement", "osiągnięcia": "achievements", "osiągnięć": "achievements", "wygrane": "wins", "porażki": "losses", "głosowaniu": "vote", "głosowaniach": "votes", "📺 Multistream": "📺 Multistream", "Wybierz do 4 transmisji:": "Pick up to 4 streams:", "Układ:": "Layout:", "▭ jeden pod drugim": "▭ stacked", "▭▭ obok siebie": "▭▭ side by side", "🔗 Kopiuj link": "🔗 Copy link", "🔊 Słuchasz": "🔊 Listening", "🔈 Słuchaj tego": "🔈 Listen to this", "↗ Otwórz osobno": "↗ Open separately", "▶ Otwórz transmisję": "▶ Open stream", "nie pozwala wbudować transmisji na stronie.": "doesn't allow embedding the stream on the site.", "Kliknij transmisje powyżej, żeby je włączyć.": "Click streams above to turn them on.", "Brak transmisji — drużyny nie podały linków do streamów.": "No streams — teams haven't added stream links.", "Gdy drużyny dodadzą linki do streamów, zobaczysz je tutaj — najlepiej przed meczem 🔴": "When teams add stream links, you'll see them here — best before the match 🔴", "Dźwięk gra tylko z jednej transmisji (🔊) — reszta jest wyciszona. Twitch, YouTube i Kick działają w okienkach; Facebook i TikTok otwierają się w nowej karcie.": "Sound plays from one stream only (🔊) — the rest are muted. Twitch, YouTube and Kick play in windows; Facebook and TikTok open in a new tab.", "📺 Oglądaj obie strony": "📺 Watch both sides", "📺 Multistream — wszystkie mecze na żywo": "📺 Multistream — all live matches", "Maksymalnie 4 transmisje naraz": "At most 4 streams at once", "📊 ZAAWANSOWANE STATYSTYKI": "📊 ADVANCED STATS", "UDZIAŁ RZUTÓW": "SHOT SHARE", "UDZIAŁ PKT": "POINT SHARE", "RZUTY ZA 3": "3PT RATE", "Skuteczność (TS%) lepsza niż": "Efficiency (TS%) better than", "graczy ligi": "of league players", "W wyrównanych meczach": "In close games", "(różnica ≤ 5 pkt):": "(margin ≤ 5 pts):", "jeszcze nie grał": "hasn't played one yet", "W wygranych:": "In wins:", "w przegranych:": "in losses:", "Regularność:": "Consistency:", "🧱 bardzo regularny": "🧱 very consistent", "📏 regularny": "📏 consistent", "🎢 zmienny": "🎢 streaky", "Brak meczów w tym zakresie.": "No games in this range.", "📊 KWARTY I KOŃCÓWKI — TEN SEZON": "📊 QUARTERS AND FINISHES — THIS SEASON", "Najmocniejsza kwarta:": "Strongest quarter:", "najsłabsza:": "weakest:", "Wyrównane mecze (≤ 5 pkt):": "Close games (≤ 5 pts):", "Odrobione straty po 3. kwarcie:": "Comebacks after Q3:", "roztrwonione prowadzenie:": "blown leads:", "dogrywki:": "overtimes:", "Kwarty z": "Quarters from", "meczów (reszta bez odczytanych kwart).": "games (the rest without read quarters).", "True Shooting — skuteczność z uwzględnieniem trójek i rzutów wolnych": "True Shooting — efficiency including threes and free throws", "Effective FG — trójka liczy się jak 1,5 rzutu": "Effective FG — a three counts as 1.5 shots", "Asysty na jedną stratę": "Assists per turnover", "Przechwyty + bloki na mecz": "Steals + blocks per game", "Jaką część rzutów drużyny oddaje zawodnik": "Share of the team's shots taken by the player", "Jaką część punktów drużyny zdobywa zawodnik": "Share of the team's points scored by the player", "Odsetek rzutów oddawanych zza łuku": "Share of shots from beyond the arc", "Rzuty wolne na 100 rzutów z gry — jak często wymusza faule": "Free throws per 100 field goal attempts — how often they draw fouls", "🔔 POWIADOMIENIA": "🔔 NOTIFICATIONS", "Powiadomienia są": "Notifications are", "włączone": "on", "na tym urządzeniu.": "on this device.", "⏰ Mecz mojej drużyny za godzinę": "⏰ My team's match in an hour", "🏀 Skład fantasy zamyka się za 3 h": "🏀 Fantasy lineup locks in 3 h", "🎯 Wynik mojego typu (trafiony / nie)": "🎯 Result of my pick (hit / miss)", "🔴 Każdy mecz ligi na żywo": "🔴 Every league match going live", "Wyłącz": "Turn off", "🔔 Włącz powiadomienia": "🔔 Turn on notifications", "Dostawaj powiadomienia na telefon: mecz Twojej drużyny za godzinę, zamknięcie składu fantasy, wynik Twojego typu.": "Get phone notifications: your team's match in an hour, fantasy lineup lock, your pick's result.", "Powiadomienia są zablokowane w ustawieniach przeglądarki dla tej strony.": "Notifications are blocked in your browser settings for this site.", "Na iPhonie powiadomienia działają w zainstalowanej aplikacji: Udostępnij → „Do ekranu początkowego”, potem otwórz ligę z ikony i wróć tutaj.": "On iPhone notifications work in the installed app: Share → “Add to Home Screen”, then open the league from the icon and come back here.", "Ta przeglądarka nie obsługuje powiadomień.": "This browser doesn't support notifications.", "🔔 Powiadomienia włączone": "🔔 Notifications on", "Powiadomienia wyłączone": "Notifications off", "Powiadomienia nie zostały zezwolone": "Notifications weren't allowed", "🧪 Wysłano — powiadomienie powinno pojawić się za chwilę": "🧪 Sent — the notification should appear shortly", "🤖 Komendy bota": "🤖 Bot commands", "🤖 Komendy bota na Discordzie": "🤖 Bot commands on Discord", "📝 Zarejestruj komendy": "📝 Register commands", "🔄 Odśwież dane bota": "🔄 Refresh bot data", "🔄 Dane dla bota odświeżone": "🔄 Bot data refreshed", "⏳ Rejestruję…": "⏳ Registering…", "Zgoda przeglądarki:": "Browser permission:", "Aplikacja (sw.js) w aktualnej wersji": "App (sw.js) is up to date", "przyjęła wiadomość": "accepted the message", "Usługa push": "Push service", "🧪 Wysłano — zobacz wynik diagnostyki": "🧪 Sent — see the diagnostics", "⏳ Sprawdzam…": "⏳ Checking…", "🔤 Nicki dopasowane do składów:": "🔤 Nicks matched to rosters:", "nick poprawiony": "nick fixed", "nicki poprawione": "nicks fixed", "nicków poprawionych": "nicks fixed", "wg składów": "by roster", "🧠 NAJLEPSZE TERMINY WG DOSTĘPNOŚCI": "🧠 BEST SLOTS BY AVAILABILITY", "✨ Zaproponuj 2 najlepsze": "✨ Propose the best 2", "✨ Zaproponuj ten termin": "✨ Propose this slot", "Liczba graczy obu drużyn dostępnych w tym oknie (wg Moich paneli).": "Number of available players from both teams in this window (from My panels).", "🧠 Asystent terminów zadziała, gdy gracze obu drużyn ustawią dostępność w Moim panelu.": "🧠 The scheduling assistant works once players of both teams set availability in My panel.", "🧠 Brak wspólnych dni w dostępności graczy w tym tygodniu.": "🧠 No common days in players' availability this week.", "Wybierz jeszcze dzień zapasowy i zapisz": "Pick a backup day too and save", "🛡 Do sprawdzenia:": "🛡 To review:", "✓ Sprawdzony — wszystko OK": "✓ Reviewed — all OK", "✓ Sprawdzony": "✓ Reviewed", "Otwórz": "Open", "🛡 Wyniki do sprawdzenia": "🛡 Results to review", "Mecze, w których coś się nie zgadza — zwykle błąd odczytu screena. Otwórz mecz, popraw w ✏️ Edytuj albo oznacz jako sprawdzony.": "Matches where something doesn't add up — usually a screenshot reading error. Open the match, fix it in ✏️ Edit or mark it as reviewed.", "✅ Wszystkie wyniki wyglądają poprawnie.": "✅ All results look correct.", "suma punktów graczy": "players' points total", "≠ wynik": "≠ score", "suma kwart": "quarters total", "w statystykach": "in the stats", "jest w obu drużynach": "is on both teams", "Obie drużyny mają tę samą nazwę": "Both teams have the same name", "Ten sam screen był już wrzucony": "The same screenshot was already uploaded", "📋 PIERWSZE KROKI ·": "📋 FIRST STEPS ·", "🔗 Połącz konto z drużyną": "🔗 Link your account to a team", "🎮 Wybierz swój nick ze składu": "🎮 Pick your nick from the roster", "📅 Ustaw, w które dni możesz grać": "📅 Set the days you can play", "🎯 Wytypuj pierwszy mecz w typerze": "🎯 Make your first pick", "🏀 Zbuduj skład w Fantasy": "🏀 Build your Fantasy lineup", "🧢 Dodaj logo drużyny": "🧢 Add a team logo", "🧢 Ustaw kanał transmisji drużyny": "🧢 Set the team stream channel", "🧢 Zaproś graczy do połączenia kont (min. 3)": "🧢 Invite players to link accounts (min. 3)", "🔎 Szukaj gracza…": "🔎 Search player…", "Wszyscy": "All", "Nikt nie pasuje do filtra": "Nobody matches the filter", "⏰ WYBIERA TERAZ": "⏰ ON THE CLOCK", "🏀 Tablica": "🏀 Board", "pkt /": "pts /", "m.": "g.", "📝 Zapisz się na listę rezerwową": "📝 Join the waitlist", "Wypisz się z rezerwy": "Leave the waitlist", "⏳ LISTA REZERWOWA": "⏳ WAITLIST", "Gdy ktoś się wypisze, pierwsza osoba z rezerwy wchodzi automatycznie i dostaje wiadomość na Discordzie.": "When someone drops out, the first person on the waitlist gets in automatically and receives a Discord message.", "Jesteś już na liście rezerwowej": "You're already on the waitlist", "Brak wolnych miejsc. Zapisać Cię na listę rezerwową? Wejdziesz automatycznie, gdy zwolni się miejsce.": "The event is full. Join the waitlist? You will get in automatically when a spot opens.", "Ostatnie miejsce właśnie się zajęło. Zapisać Cię na listę rezerwową?": "The last spot was just taken. Join the waitlist?", "👋 Wypisano z eventu": "👋 Left the event", "🎪 Zalogowano jako Event manager (Discord)": "🎪 Logged in as Event manager (Discord)", "🎪 Eventy przeniesione do osobnego zapisu": "🎪 Events moved to separate storage", "🤖 OCENY DRAFTU": "🤖 DRAFT GRADES", "Oceny draftu (AI)": "Draft grades (AI)", "Oceń ponownie": "Grade again", "🤖 AI ocenia draft…": "🤖 AI is grading the draft…", "🤖 Oceny draftu gotowe": "🤖 Draft grades ready", "Zbalansowany skład na każdej pozycji.": "A balanced roster at every position.", "Solidny skład, ale brakuje:": "Solid roster, but missing:", "📅 PODCAST TYGODNIA — AUTOMATYCZNIE": "📅 WEEKLY PODCAST — AUTOMATIC", "Gdy wszystkie mecze kolejki mają wyniki, bot sam przygotuje odcinek (statystyki tygodnia, bohaterowie, „cegły”, tabela, fantasy, zapowiedź — maks. ok. 5 min) i opublikuje go na kanale „Podcast tygodnia” z 📣 Kanałów powiadomień.": "When all matches of a round have results, the bot prepares an episode on its own (weekly stats, heroes, “bricks”, standings, fantasy, preview — max ~5 min) and publishes it on the “Weekly podcast” channel from 📣 Notification channels.", "🧪 Próbka do mnie (DM)": "🧪 Sample to me (DM)", "📣 Opublikuj na kanale": "📣 Publish to channel", "automatycznie po kolejce": "automatically after each round", "(niekompletna)": "(incomplete)", "brak kolejek": "no rounds", "✍️ WŁASNY ODCINEK (w przeglądarce)": "✍️ CUSTOM EPISODE (in the browser)", "Scenariusz: każda linijka to": "Script: each line is", "Imię: tekst": "Name: text", ". Napisz go sam, wklej albo poproś AI o odcinek z prawdziwych danych ligi. Nagranie robią naturalne głosy Gemini (ok. 30–90 s czekania).": ". Write it yourself, paste it, or ask AI for an episode from real league data. Natural Gemini voices record it (about 30–90 s).", "⏳ Zlecam nagranie…": "⏳ Requesting the recording…", "🎙 Automatyczne odcinki włączone": "🎙 Automatic episodes on", "Automatyczne odcinki wyłączone": "Automatic episodes off", "Worker nie ma BOT_URL — automatyczne odcinki nie zadziałają.": "The Worker has no BOT_URL — automatic episodes won't work.", "🎙 Głosy i imiona prowadzących bierzemy z pól poniżej (Prowadzący 1 / 2) — zapamiętujemy je też dla automatycznych odcinków.": "🎙 Host voices and names come from the fields below (Host 1 / 2) — they're also remembered for automatic episodes.", "🗑 Testowe": "🗑 Test events", "♻️ Przywróć": "♻️ Restore", "♻️ Przywróć eventy z kopii zapasowej": "♻️ Restore events from backup", "🔍 Pokaż eventy z tej kopii": "🔍 Show events from this backup", "♻️ Przywróć zaznaczone": "♻️ Restore selected", "🎧 Podcast": "🎧 Podcast", "Podcast ligi NBA 2K Pro-Am": "The NBA 2K Pro-Am league podcast", "Co tydzień po kolejce: wyniki, bohaterowie, „cegły tygodnia”, tabela i zapowiedzi — z humorem i rzetelnymi statystykami.": "Every week after the round: results, heroes, “bricks of the week”, standings and previews — with humor and solid stats.", "Pierwszy odcinek pojawi się po zakończeniu kolejki 🎙": "The first episode appears once a round is finished 🎙", "NOWY": "NEW", "usuń": "delete", "⏳ Wczytuję odcinki…": "⏳ Loading episodes…", "📋 Skopiowano adres RSS — wklej go w swojej aplikacji do podcastów": "📋 RSS address copied — paste it into your podcast app", "✅ Zapisano linki": "✅ Links saved", "🗑 Usunięto odcinek": "🗑 Episode deleted", "🎬 Short": "🎬 Short", "🎬 Short tygodnia": "🎬 Short of the week", "dźwięk z podcastu": "podcast audio", "👁 Podgląd": "👁 Preview", "⏺ Nagraj": "⏺ Record", "⏳ Przygotowuję…": "⏳ Preparing…", "⬇ Pobierz wideo": "⬇ Download video", "🔥 AUDIOZAPOWIEDZI KLASYKÓW": "🔥 CLASSIC MATCH AUDIO PREVIEWS", "🧪 Próbka (DM)": "🧪 Sample (DM)", "📣 Opublikuj": "📣 Publish", "automatycznie": "automatically", "brak nadchodzących meczów": "no upcoming matches", "🔥 Automatyczne zapowiedzi włączone": "🔥 Automatic previews on", "Automatyczne zapowiedzi wyłączone": "Automatic previews off", "Ok. 3 h przed meczem drużyn, które grały ze sobą min. 6 razy (🔥 Klasyk), bot nagrywa 30–45 s zapowiedź: historia starć, forma, gwiazdy pojedynków, typy prowadzących.": "About 3 h before a match between teams that have met at least 6 times (🔥 Classic), the bot records a 30–45 s preview: head-to-head history, form, standout players, hosts' picks.", "✅ Short wysłany na Discord": "✅ Short sent to Discord", "⏳ Wysyłam na Discord…": "⏳ Sending to Discord…", "🧩 2Kordle": "🧩 2Kordle", "2Kordle — zagadka dnia": "2Kordle — daily puzzle", "Zgadnij": "Guess", "🏆 RANKING MIESIĄCA": "🏆 MONTHLY RANKING", "📋 Udostępnij wynik": "📋 Share result", "Dzisiejszy zawodnik:": "Today's player:", "😵 Tym razem nie": "😵 Not this time", "Pierwsza próba czeka 👀": "Your first guess awaits 👀", "📋 Skopiowano — wklej na Discordzie!": "📋 Copied — paste it on Discord!", "Nie ma takiego zawodnika w puli — wybierz z podpowiedzi": "No such player in the pool — pick from suggestions", "Ten zawodnik już był": "Already guessed", "🏆 WYŚCIG O MVP SEZONU": "🏆 SEASON MVP RACE", "cały ranking →": "full ranking →", "🏆 Wyścig o MVP": "🏆 MVP race", "🏅 Odznaka miesiąca zdobyta!": "🏅 Monthly badge earned!", "wyłącz wyzwania": "turn off challenges", "Zagraj 4 mecze ligowe": "Play 4 league games", "Zrób double-double": "Record a double-double", "Traf 3 typy w typerze": "Get 3 picks right", "Odgadnij 5 zagadek 2Kordle": "Solve 5 2Kordle puzzles", "Kolejka fantasy za 100+ pkt": "A 100+ pt fantasy round", "lider ligi i jego drużyna wygrywa": "league leader and his team wins", "najlepsze liczby w lidze": "best numbers in the league", "maszyna do punktów": "scoring machine", "mózg zespołu": "the team's brain", "pan od tablic": "glass cleaner", "wygrywa i dowozi": "wins and delivers", "solidnie w czołówce": "solid at the top", "własny plik audio": "own audio file", "🔇 bez dźwięku": "🔇 no sound", "⬆ Dodaj odcinek z pliku": "⬆ Add an episode from a file", "⬆ Dodaj": "⬆ Add", "Plik MP3": "MP3 file", "✅ Odcinek dodany": "✅ Episode added", "⏳ Wgrywam…": "⏳ Uploading…", "🖼 Podsumowanie kolejki": "🖼 Round summary", "🖼 Generuj": "🖼 Generate", "⬇ Pobierz PNG": "⬇ Download PNG", "📋 Kopiuj tekst": "📋 Copy text", "🐦 Otwórz na Twitterze": "🐦 Open on Twitter", "🏟 Tło: Arena": "🏟 Background: Arena", "🖼 Tło: własne": "🖼 Background: custom", "⬆ Wgraj tło": "⬆ Upload background", "⬆ Zmień tło": "⬆ Change background", "🖼 Tło zapisane": "🖼 Background saved", "📸 Czekające wyniki": "📸 Pending results", "🔔 Ponagl": "🔔 Nudge", "✅ Zatwierdź sam": "✅ Approve myself", "👁 Pokaż w terminarzu": "👁 Show in schedule", "✅ Nic nie czeka — wszystkie zgłoszone wyniki są rozpatrzone.": "✅ Nothing pending — all submitted results are handled.", "profil Discord ↗": "Discord profile ↗", "🧪 Do mnie (DM)": "🧪 To me (DM)", "📣 Na kanał podsumowania tygodnia": "📣 To the weekly summary channel", "⏳ Zlecam botowi…": "⏳ Asking the bot…", "😀 Dodaj brakujące": "😀 Add missing", "🔄 Odśwież wszystkie (po zmianie herbów)": "🔄 Refresh all (after logo changes)", "publikuj automatycznie po podcaście": "post automatically after the podcast", "🔌 Sprawdź połączenie": "🔌 Check connection", "🐦 Opublikuj tę kolejkę na X teraz": "🐦 Post this round to X now", "🐦 Automatyczna publikacja na X włączona": "🐦 Automatic posting to X on", "Zapisano ustawienia X": "X settings saved", "⏳ Łączę się z X…": "⏳ Connecting to X…", "⏳ Bot publikuje na X…": "⏳ The bot is posting to X…", "🃏 Karta gracza": "🃏 Player card", "⬇ Pobierz": "⬇ Download", "Brak meczów tego gracza": "No games for this player", "🔗 Udostępnij": "🔗 Share", "🔗 Udostępnij drużynę": "🔗 Share team", "🔗 Link": "🔗 Link", "📣 Ogłoś typowanie": "📣 Announce picks", "🏆 Ogłoś zwycięzców typowania": "🏆 Announce pick winners", "🔗 Skopiowano link — po wklejeniu na Discordzie czy X pokaże się podgląd z grafiką": "🔗 Link copied — pasting it on Discord or X shows a preview with a graphic", "🔁 Okno transferowe": "🔁 Trade window", "Okno transferowe": "Trade window", "🔁 Okno transferowe — wymiany graczy": "🔁 Trade window — player swaps", "🔁 Wyślij propozycję": "🔁 Send proposal", "🤝 Akceptuję": "🤝 Accept", "❌ Odrzucam": "❌ Reject", "↩ Anuluj": "↩ Cancel", "✅ Zatwierdź wymianę": "✅ Approve trade", "✅ OSTATNIE WYMIANY": "✅ RECENT TRADES", "MOJA DRUŻYNA": "MY TEAM", "Jeszcze nie było wymian.": "No trades yet.", "🔒 Okno zamknięte": "🔒 Window closed", "Oddajesz (1–3):": "You give (1–3):", "Chcesz w zamian (1–3):": "You want (1–3):", "Wiadomość do kapitana (opcjonalnie)": "Message to the captain (optional)", "🎖 GALA SEZONU — ODCINEK SPECJALNY": "🎖 SEASON GALA — SPECIAL EPISODE", "🖼 Plansza Gali (PNG)": "🖼 Gala board (PNG)", "📣 Plansza na Discord": "📣 Board to Discord", "Ceremonia wręczenia nagród z ostatniego zakończonego głosowania Gali: zwycięzcy kategorii, drużyna sezonu, wspomnienia sezonu — z napięciem i humorem (ok. 6 min).": "An awards ceremony from the latest closed Gala vote: category winners, team of the season, season memories — with suspense and humor (~6 min).", "📅 Bieżący sezon": "📅 Current season", "🏆 Kariera": "🏆 Career", "🖼 Avatar z Discorda": "🖼 Discord avatar", "🎖 Synchronizuj role drużyn": "🎖 Sync team roles", "🏅 Liga kibiców": "🏅 Fan league", "Liga kibiców": "Fan league", "🏅 Kibice": "🏅 Fans", "📜 Regulamin terminów": "📜 Deadline rules", "🩺 Stan systemu": "🩺 System status", "📨 Test alertu DM": "📨 Test DM alert", "🏳 Walkower…": "🏳 Walkover…", "⏳ Przedłuż o 3 dni": "⏳ Extend by 3 days", "✓ Załatwione / pomiń": "✓ Done / skip", "Regulamin włączony": "Rules enabled", "📨 Wyślij mi powitanie (test)": "📨 Send me the welcome (test)", "⚙ Admin: Spotify / Apple i kanał RSS": "⚙ Admin: Spotify / Apple and RSS feed", "Adres kanału RSS do zgłoszenia w": "RSS feed address to submit in", "(Add podcast → „I already have a podcast” → RSS) i": "(Add podcast → “I already have a podcast” → RSS) and", "Np. odcinek opublikowany wcześniej tylko na Discordzie — pobierz MP3 z wiadomości i wgraj tutaj. Ta sama kolejka zastąpi poprzednią wersję.": "E.g. an episode published earlier only on Discord — download the MP3 from the message and upload it here. The same round replaces the previous version.", "Zagadka ruszy, gdy w tej edycji zawodnicy rozegrają po kilka meczów.": "The puzzle starts once players in this edition have played a few games.", "Najwyższy poziom — Legenda ligi! 👑": "Top level — league Legend! 👑", "Jak zdobywać punkty kibica (XP)?": "How to earn fan points (XP)?", "🎯 trafiony typ meczu": "🎯 correct match pick", "połowa": "half", "punktów sezonu · 🔮 trafione typy przedsezonowe": "of season points · 🔮 correct preseason picks", "za punkt · 🧩 odgadnięte 2Kordle": "per point · 🧩 solved 2Kordle", "(im szybciej, tym więcej)": "(the faster, the more)", "Ocena = średnia „game score” na mecz + bonus za wygrane drużyny · min. połowa meczów drużyny · ▲▼ zmiana od początku tygodnia": "Score = average “game score” per game + bonus for team wins · min. half of the team's games · ▲▼ change since the start of the week", "🏀 Punkty (śr.)": "🏀 Points (avg)", "💪 Zbiórki (śr.)": "💪 Rebounds (avg)", "🎯 Asysty (śr.)": "🎯 Assists (avg)", "🐍 Przechwyty (śr.)": "🐍 Steals (avg)", "🛡️ Bloki (śr.)": "🛡️ Blocks (avg)", "(min.2 mecze)": "(min. 2 games)", "✅ 🔗 Połącz konto z drużyną": "✅ 🔗 Link your account to a team", "✅ 🎮 Wybierz swój nick ze składu": "✅ 🎮 Pick your nick from the roster", "⬜ 📅 Ustaw, w które dni możesz grać": "⬜ 📅 Set which days you can play", "⬜ 🔔 Włącz powiadomienia": "⬜ 🔔 Turn on notifications", "⬜ 📲 Zainstaluj aplikację na telefonie": "⬜ 📲 Install the app on your phone", "⬜ 🎯 Wytypuj pierwszy mecz w typerze": "⬜ 🎯 Make your first pick", "⬜ 🏀 Zbuduj skład w Fantasy": "⬜ 🏀 Build your Fantasy lineup", "⬜ 🧢 Dodaj logo drużyny": "⬜ 🧢 Add the team logo", "⬜ 🧢 Ustaw kanał transmisji drużyny": "⬜ 🧢 Set the team stream channel", "⬜ 🧢 Zaproś graczy do połączenia kont (min. 3)": "⬜ 🧢 Invite players to link accounts (min. 3)", "🔗 Połącz konto z drużyną (niżej)": "🔗 Link your account to a team (below)", "do": "to", "(puste = cały wieczór)": "(empty = whole evening)", "Wyjątek na Week 1": "Exception for Week 1", "(zostaw puste = jak zwykle)": "(leave empty = as usual)", "🤝 przyjęta — czeka na admina": "🤝 accepted — waiting for admin", "⏳ czeka na odpowiedź": "⏳ waiting for a reply", "Poziom karty zależy od oceny formy: 🥉 brąz · 🥈 srebro · 🥇 złoto · 💎 diament · 🌌 galaktyka. Na Discordzie:": "Card tier depends on the form rating: 🥉 bronze · 🥈 silver · 🥇 gold · 💎 diamond · 🌌 galaxy. On Discord:", "Bot na Railway": "Bot on Railway", "Wyniki czekające na potwierdzenie": "Results awaiting confirmation", "Regulamin — sprawy do decyzji": "Rules — cases to decide", "Alerty DM do adminów": "DM alerts to admins", "⚠️ OSTATNIE BŁĘDY BOTA": "⚠️ LATEST BOT ERRORS", "Alerty DM przychodzą same: gdy bot przestanie odpowiadać (i gdy wróci), gdy nie uda się podcast, grafiki lub zapowiedź, oraz gdy regulamin wykryje mecz po terminie.": "DM alerts arrive automatically: when the bot stops responding (and when it's back), when a podcast, graphics or preview fails, and when the rules detect a match past its deadline.", "Mecz kolejki trzeba": "A round's match must be", "umówić": "scheduled", "do:": "by:", "rozegrać": "played", "Dzień przed terminem kapitanowie obu drużyn dostają przypomnienie w DM. Po terminie mecz trafia tutaj z propozycją decyzji, a Ty dostajesz alert — decyzja zawsze należy do Ciebie.": "A day before the deadline both captains get a DM reminder. After the deadline the match lands here with a suggested decision and you get an alert — the decision is always yours.", "nieumówiony": "not scheduled", "Grafiki 1600×900 (16:9 — tak Twitter pokazuje obrazki w podglądzie): wyniki serii z MVP i wyróżnionymi (średnie na mecz) oraz ciekawostki tygodnia. Plus gotowy tekst tweeta.": "1600×900 graphics (16:9 — how Twitter shows images in previews): series results with MVPs and standouts (per-game averages) plus weekly fun facts. Plus a ready tweet text.", "🤖 Przez bota (PL + EN naraz, tło Arena)": "🤖 Via the bot (PL + EN at once, Arena background)", "— 4 grafiki i teksty tweetów w jednej wiadomości:": "— 4 graphics and tweet texts in one message:", "kliknij „Sprawdź połączenie”, żeby zobaczyć konto": "click “Check connection” to see the account", "Link z podglądem grafiki — do wklejenia na X / Discord": "Link with a graphic preview — to paste on X / Discord", "Pionowe wideo 1080×1920 (~40 s) do TikToka, Reels i Shorts: tytuł, wyniki, bohater, cegła tygodnia, tabela. W tle początek odcinka podcastu z tej kolejki (jeśli jest). Nagrywa się w czasie rzeczywistym — nie zamykaj okna.": "Vertical 1080×1920 video (~40 s) for TikTok, Reels and Shorts: title, results, hero, brick of the week, standings. In the background: the start of this round's podcast episode (if there is one). Recorded in real time — don't close the window.", "Np. muzyka w tle — ma pierwszeństwo przed podcastem": "E.g. background music — takes priority over the podcast", "Prowadzący 1": "Host 1", "Głos": "Voice", "Prowadzący 2": "Host 2", "✍️ Napisz z danych ligi (AI)": "✍️ Write from league data (AI)", "↺ Przykładowy scenariusz": "↺ Sample script", "🤖 Modele Gemini (wybierane automatycznie): tekst i screeny": "🤖 Gemini models (picked automatically): text & screenshots", "· głosy": "· voices", "brak modelu TTS": "no TTS model", "🔄 sprawdź ponownie": "🔄 check again", "Kapitan rywali dostaje DM od razu po zgłoszeniu, a potem automatyczne przypomnienia po 12 h i po 36 h. Możesz go ponaglić ręcznie albo zdecydować sam.": "The opposing captain gets a DM right after submission, then automatic reminders after 12 h and 36 h. You can nudge them manually or decide yourself.", "📤 Wrzucił:": "📤 Submitted by:", "brak kapitana z Discordem": "no captain with Discord", "📣 Kanały powiadomień": "📣 Notification channels", "ID kanału": "channel ID", "(Discord: prawy klik na kanał → Kopiuj ID kanału),": "(Discord: right-click the channel → Copy Channel ID),", "żeby wyłączyć, albo zostaw puste — wtedy jak dotąd (webhook). Bot ligi sam zakłada w każdym kanale webhook z nazwą i logo ligi — potrzebuje tam uprawnień": "to turn it off, or leave empty — then as before (webhook). The league bot creates a webhook with the league name and logo in each channel — it needs these permissions there:", "Wyświetlanie kanału": "View Channel", "Zarządzanie webhookami": "Manage Webhooks", ". Bez tego wiadomość pójdzie jako bot.": ". Without it the message goes out as the bot.", "🧢 DRUŻYNY": "🧢 TEAMS", "🆓 WOLNI AGENCI I TRANSFERY": "🆓 FREE AGENTS & TRANSFERS", "📅 TERMINARZ I SEZON": "📅 SCHEDULE & SEASON", "😀 Emoji drużyn": "😀 Team emoji", "— bot wgrywa herby zatwierdzonych drużyn i logo ligi jako emoji serwera (np.": "— the bot uploads approved teams' logos and the league logo as server emoji (e.g.", ") i dodaje je do wiadomości. Wymaga uprawnienia bota": ") and adds them to messages. Requires the bot permission", "Zarządzanie wyrażeniami": "Manage Expressions", ". Raport przyjdzie Ci w DM.": ". The report arrives in your DMs.", "🎖 Role drużyn": "🎖 Team roles", "— bot tworzy dla każdej drużyny rolę z jej kolorem i herbem (ikona roli) i nadaje ją graczom ze składu. Po zatwierdzonych wymianach i zmianach składów aktualizuje się sama. Wymaga uprawnienia bota": "— the bot creates a role for every team with its color and logo (role icon) and assigns it to roster players. It updates itself after approved trades and roster changes. Requires the bot permission", ", a rola bota musi być wyżej na liście ról niż role drużyn. Raport przyjdzie Ci w DM.": ", and the bot's role must be above the team roles in the role list. The report arrives in your DMs.", "👋 Powitanie nowych osób": "👋 Welcoming new members", "— każda nowa osoba na serwerze dostaje od bota DM z wyborem „Chcę grać / Chcę kibicować” (wybór drużyny daje rolę kibica). Działa samo.": "— every new server member gets a DM from the bot with a “I want to play / I want to support a team” choice (picking a team gives a fan role). Works automatically.", "jak dotąd (webhook)": "as before (webhook)", "{n} XP · {n}. miejsce z {n}": "{n} XP · #{n} of {n}", "🛡 Do sprawdzenia ({n})": "🛡 To review ({n})", "📸 Czekające wyniki ({n})": "📸 Pending results ({n})", "🏅 {n}. Kolejka": "🏅 Round {n}", "· {n} meczów · min. {n} mecze/zawodnik": "· {n} games · min. {n} games/player", "{n} meczów": "{n} games", "{n} mecze": "{n} games", "{n}W z rzędu": "{n}W in a row", "{n}L z rzędu": "{n}L in a row", "🟢 Okno otwarte do {n}-{n}-{n}": "🟢 Window open until {n}-{n}-{n}", "🛡 DO ZATWIERDZENIA ({n})": "🛡 TO APPROVE ({n})", "online · {n} min od startu · {n} MB": "online · {n} min since start · {n} MB", "⚖️ DO DECYZJI ({n})": "⚖️ TO DECIDE ({n})", "po terminie · wykryto {n} h temu": "past the deadline · detected {n} h ago", "po terminie · wykryto {n} min temu": "past the deadline · detected {n} min ago", "po terminie · wykryto {n} dni temu": "past the deadline · detected {n} days ago", "📸 Wyniki czekające na potwierdzenie ({n})": "📸 Results awaiting confirmation ({n})", "⏱ czeka {n} dni": "⏱ waiting {n} days", "⏱ czeka {n} h": "⏱ waiting {n} h", "⏱ czeka {n} min": "⏱ waiting {n} min", "{n} pkt · {n} zb. · {n} as. · lider ligi i jego drużyna wygrywa": "{n} pts · {n} reb · {n} ast · league leader and his team wins", "{n} pkt · {n} zb. · {n} as. · maszyna do punktów": "{n} pts · {n} reb · {n} ast · scoring machine", "{n} pkt · {n} zb. · {n} as. · wygrywa i dowozi": "{n} pts · {n} reb · {n} ast · wins and delivers", "{n} pkt · {n} zb. · {n} as. · mózg zespołu": "{n} pts · {n} reb · {n} ast · the team's brain", "{n} pkt · {n} zb. · {n} as. · pan od tablic": "{n} pts · {n} reb · {n} ast · glass cleaner", "{n} pkt · {n} zb. · {n} as. · solidnie w czołówce": "{n} pts · {n} reb · {n} ast · solid at the top", "{n} pkt · {n} zb. · {n} as. · najlepsze liczby w lidze": "{n} pts · {n} reb · {n} ast · best numbers in the league", "Poziomy: Rookie ({n}) → Rotacja ({n}) → Starter ({n}) → Szósty gracz ({n}) → All-Star ({n}) → MVP ({n}) → Legenda ({n}). Od poziomu „Rotacja” dostajesz rolę na Discordzie.": "Levels: Rookie ({n}) → Rotation ({n}) → Starter ({n}) → Sixth man ({n}) → All-Star ({n}) → MVP ({n}) → Legend ({n}). From “Rotation” up you get a Discord role.", "Poziomy: Rookie ({n}) → Rotacja ({n}) → Starter ({n}). Od poziomu „Rotacja” dostajesz rolę na Discordzie.": "Levels: Rookie ({n}) → Rotation ({n}) → Starter ({n}). From “Rotation” up you get a Discord role.", "🏅 WYZWANIA — PAŹDZIERNIK · {n}/{n}": "🏅 CHALLENGES — OCTOBER · {n}/{n}", "🏅 WYZWANIA — LISTOPAD · {n}/{n}": "🏅 CHALLENGES — NOVEMBER · {n}/{n}", "🏅 WYZWANIA — GRUDZIEŃ · {n}/{n}": "🏅 CHALLENGES — DECEMBER · {n}/{n}", "Do poziomu „Starter”: {n} XP": "To “Starter”: {n} XP", "Do poziomu „Rotacja”: {n} XP": "To “Rotation”: {n} XP", "Do poziomu „Szósty gracz”: {n} XP": "To “Sixth man”: {n} XP", "Do poziomu „All-Star”: {n} XP": "To “All-Star”: {n} XP", "Do poziomu „MVP”: {n} XP": "To “MVP”: {n} XP", "Do poziomu „Legenda”: {n} XP": "To “Legend”: {n} XP", "Rotacja": "Rotation", "Szósty gracz": "Sixth man", "Legenda": "Legend", "📅 NAJBLIŻSZE MECZE — {s}": "📅 UPCOMING GAMES — {s}", "👥 MOJA DRUŻYNA — {s}": "👥 MY TEAM — {s}", "Aoede — swobodna (K)": "Aoede — relaxed (F)", "Charon — spokojny narrator (M)": "Charon — calm narrator (M)", "Fenrir — emocjonalny (M)": "Fenrir — emotional (M)", "Kore — pewna siebie (K)": "Kore — confident (F)", "Leda — młodzieżowa (K)": "Leda — youthful (F)", "Orus — zdecydowany (M)": "Orus — decisive (M)", "Puck — energiczny (M)": "Puck — energetic (M)", "Zephyr — jasna, pogodna (K)": "Zephyr — bright, cheerful (F)", "🏆 Liga GM": "🏆 GM League", "Liga GM": "GM League", "Zapisy są zamknięte": "Sign-ups are closed", "Podaj nazwę drużyny (min. 3 znaki)": "Enter a team name (min. 3 characters)", "Ta nazwa drużyny jest już zajęta": "This team name is already taken", "Brak wolnych miejsc": "No spots left", "GM nie może wybrać siebie": "A GM can't pick themselves", "GM nie może kupić siebie": "A GM can't buy themselves", "Teraz zgłasza inny GM": "Another GM is nominating now", "Ten zawodnik jest już sprzedany": "This player is already sold", "Trwa licytacja": "Bidding in progress", "Nie trwa żadna licytacja": "No bidding in progress", "Prowadzisz już w tej licytacji": "You are already leading this bid", "Ktoś właśnie przebił — sprawdź nową kwotę": "Someone just outbid you — check the new amount", "Aukcja zakończona": "Auction finished", "Aukcja jest wstrzymana": "Auction is paused", "Nie jesteś GM-em w tej aukcji": "You are not a GM in this auction", "Oferta musi być wyższa niż {n}": "The bid must be higher than {n}", "Maksymalnie możesz dać {n}": "Your max bid is {n}", "Maksymalnie możesz dać {n} (musisz zostawić min. 1 na każde wolne miejsce)": "Your max bid is {n} (keep at least 1 per open spot)", "Liga GM nie ma jeszcze składów": "The GM League has no rosters yet", "Nie jesteś GM-em w tym sezonie": "You are not a GM this season", "Wybierz zawodnika": "Pick a player", "Ten zawodnik jest już w składzie innego GM-a": "This player is already on another GM's roster", "GM nie może mieć siebie w składzie": "A GM can't have themselves on the roster", "Masz pełny skład — wskaż zawodnika do zwolnienia": "Your roster is full — choose a player to drop", "Tego zawodnika nie ma w Twoim składzie": "This player isn't on your roster", "Wybierz innego GM-a": "Pick another GM", "Wybierz zawodników": "Pick players", "Zawodnicy muszą być w składach obu GM-ów": "Players must be on both GMs' rosters", "Masz już 3 oczekujące propozycje": "You already have 3 pending proposals", "Nie znaleziono wymiany": "Trade not found", "Ta propozycja nie czeka na Twoją odpowiedź": "This proposal isn't waiting for your reply", "Nie możesz anulować tej wymiany": "You can't cancel this trade", "Nie możesz zgłosić sprzeciwu do tej wymiany": "You can't veto this trade", "Minęło 24 h na sprzeciw": "The 24 h veto window has passed", "Ta wymiana nie czeka na admina": "This trade isn't waiting for the admin", "Trwa jeszcze 24 h na sprzeciw GM-ów": "The 24 h GM veto window is still open", "Składy się zmieniły — wymiana jest nieaktualna": "Rosters changed — the trade is no longer valid", "Masz tylko {n} w budżecie rynku": "You only have {n} in your market budget", "Po wymianie skład przekroczyłby {n} zawodników": "After the trade a roster would exceed {n} players", "minimalna pensja to 1": "minimum salary is 1", "Minimalna pensja to 1": "Minimum salary is 1", "brak miejsca pod salary cap": "no cap space", "Pod salary cap masz miejsce na pensję do {n}": "You have cap space for a salary of up to {n}", "Po wymianie jedna z drużyn przekroczyłaby salary cap ({n})": "After the trade one of the teams would exceed the salary cap ({n})", "Dynastia jest wyłączona": "Dynasty is turned off", "Wybór zatrzymanych jest możliwy tylko przed draftem": "Keepers can only be chosen before the draft", "Najpierw zapisz się jako GM w tym sezonie": "Sign up as a GM this season first", "Nie masz składu z poprzedniego sezonu": "You have no roster from last season", "Możesz zatrzymać tylko zawodników ze swojego składu z poprzedniego sezonu": "You can only keep players from your own roster last season", "Jesteś kapitanem drużyny {s} — najpierw przekaż opaskę kapitana (napisz do admina), potem zapisz się do wolnych agentów": "You are the captain of {s} — hand over the captaincy first (contact the admin), then join the free agents", "Jesteś w składzie drużyny {s} — zapis do wolnych agentów oznacza odejście z drużyny": "You are on the {s} roster — joining the free agents means leaving the team", "Brak dostępu do kolejki X": "No access to the X queue", "Nie znaleziono szkicu": "Draft not found", "Ten wpis jest już opublikowany albo odrzucony": "This post is already published or rejected", "Brak treści do publikacji": "Nothing to publish", "Tekst przekracza 280 znaków (emoji liczą się jak 2)": "The text exceeds 280 characters (emoji count as 2)", "🐦 Kolejka X": "🐦 X queue", "Publikacja nie powiodła się": "Publishing failed", "🃏 Kolekcja kart": "🃏 Card collection", "🃏 Karty": "🃏 Cards", "Dzisiejsza paczka jest już otwarta — kolejna jutro o północy": "Today's pack is already open — the next one at midnight", "Potrzebujesz 5 duplikatów": "You need 5 duplicates", "Wybierz innego kolekcjonera": "Pick another collector", "Podarować można tylko duplikat": "You can only gift a duplicate", "Za mało zawodników w lidze": "Not enough players in the league", "🃏 Kolekcja": "🃏 Collection", "🧢 Podaj profil X (Twitter) drużyny": "🧢 Add the team's X (Twitter) profile", "Profil X drużyny ustawia kapitan": "The captain sets the team's X profile", "Podaj nazwę profilu X, np. @nazwa_druzyny (litery, cyfry, _ — maks. 15 znaków)": "Enter an X handle, e.g. @team_name (letters, digits, _ — max 15 characters)", "⬜ 🧢 Podaj profil X (Twitter) drużyny": "⬜ 🧢 Add the team's X (Twitter) profile", "✅ 🧢 Podaj profil X (Twitter) drużyny": "✅ 🧢 Add the team's X (Twitter) profile", "🏆 Drafty": "🏆 Drafts", "🏆 Drafty admin": "🏆 Drafts admin", "Opisz pomysł trochę dokładniej (min. 10 znaków)": "Describe your idea in a bit more detail (min. 10 characters)", "Dziś wysłałeś już 5 sugestii — dzięki! Kolejne jutro.": "You've already sent 5 suggestions today — thanks! More tomorrow.", "💡 Sugestie": "💡 Suggestions"};
if(currentLang === 'nl') { currentLang = 'en'; try { localStorage.setItem('nba2k_lang', 'en'); } catch(e) {} }
const _TR = (() => {
  const exact = new Map(Object.entries(PL_EN));
  // wzorce: {n} = liczba (np. „{n} XP · {n}. miejsce z {n}”), {s} = dowolny tekst (np. nazwa drużyny)
  const pats = Object.keys(PL_EN).filter(k => /\{[ns]\}/.test(k)).map(k => ({
    re: new RegExp('^' + k.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{n\}/g, '(\\d+(?:[.,]\\d+)?)').replace(/\{s\}/g, '(.+?)') + '$'), en: PL_EN[k] }));
  const viaPattern = core => { for(const p of pats) { const m = core.match(p.re); if(m) { let i = 1; return p.en.replace(/\{[ns]\}/g, () => m[i++] ?? ''); } } return null; };
  const byHead = new Map();
  Object.keys(PL_EN).sort((a, b) => b.length - a.length).forEach(k => {
    const h = k.slice(0, 2);
    if(!byHead.has(h)) byHead.set(h, []);
    byHead.get(h).push(k);
  });
  const isL = c => !!c && /[\p{L}\p{N}]/u.test(c);
  function frag(text) {
    let out = '', i = 0, changed = false;
    while(i < text.length) {
      const cands = byHead.get(text.slice(i, i + 2));
      let hit = null;
      if(cands && (!isL(text[i]) || !isL(text[i - 1]))) {
        for(const k of cands) {
          if(text.startsWith(k, i) && !(isL(k[k.length - 1]) && isL(text[i + k.length]))) { hit = k; break; }
        }
      }
      if(hit) { out += PL_EN[hit]; i += hit.length; changed = true; }
      else { out += text[i]; i++; }
    }
    return changed ? out : text;
  }
  function tr(s) {
    if(currentLang !== 'en' || s == null) return s;
    const str = String(s);
    if(!/[A-Za-zĄ-ż]/.test(str)) return str;
    const lead = str.match(/^\s*/)[0], tail = str.match(/\s*$/)[0];
    const core = str.trim().replace(/\s+/g, ' ');
    if(!core) return str;
    if(exact.has(core)) return lead + exact.get(core) + tail;
    if(/\d/.test(core) || pats.length) { const pt = viaPattern(core); if(pt != null) return lead + pt + tail; }
    if(core.length > 240) return str; // długie akapity (recapy AI, opisy graczy) zostawiamy
    const f = frag(core);
    // zdanie przetłumaczone tylko po kawałku („Gdy wszystkie matches round…”) wygląda gorzej niż po polsku — zostaw oryginał
    if(f !== core && f.length > 45 && (f.match(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g) || []).length >= 2) return str;
    return f === core ? str : lead + f + tail;
  }
  return { tr };
})();
function _tr(s) { return _TR.tr(s); }

const _I18N_SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE', 'NOSCRIPT']);
const _i18nDone = new WeakMap();
function _i18nNode(root) {
  if(currentLang !== 'en' || !root) return;
  const skip = el => { for(let e = el; e && e !== document.body; e = e.parentElement) { if(_I18N_SKIP.has(e.tagName) || e.hasAttribute?.('data-notr') || e.isContentEditable || /^match-recap/.test(e.id || '')) return true; } return false; };
  const doText = n => {
    const v = n.nodeValue;
    if(!v || _i18nDone.get(n) === v || !n.parentElement || skip(n.parentElement)) return;
    const t = _tr(v);
    _i18nDone.set(n, t);
    if(t !== v) n.nodeValue = t;
  };
  const doAttrs = el => {
    if(!el.getAttribute || el.hasAttribute('data-notr') || (el.parentElement && skip(el.parentElement))) return;
    for(const a of ['placeholder', 'title', 'aria-label']) {
      const v = el.getAttribute(a);
      if(v) { const t = _tr(v); if(t !== v) el.setAttribute(a, t); }
    }
    if(el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit') && el.value) { const t = _tr(el.value); if(t !== el.value) el.value = t; }
    if(el.tagName === 'OPTION' && el.firstChild?.nodeType === 3) doText(el.firstChild);
  };
  if(root.nodeType === 3) { doText(root); return; }
  if(root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  if(root.nodeType === 1) doAttrs(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n;
  while((n = w.nextNode())) { if(n.nodeType === 3) doText(n); else doAttrs(n); }
}
function _i18nStart() {
  if(currentLang !== 'en') return;
  document.documentElement.lang = 'en';
  _i18nNode(document.body);
  new MutationObserver(muts => {
    for(const m of muts) {
      if(m.type === 'characterData') _i18nNode(m.target);
      else if(m.type === 'attributes') _i18nNode(m.target);
      else m.addedNodes.forEach(_i18nNode);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] });
  // okna przeglądarki
  const _c = window.confirm.bind(window), _a = window.alert.bind(window), _p = window.prompt.bind(window);
  window.confirm = m => _c(_tr(m)); window.alert = m => _a(_tr(m)); window.prompt = (m, d) => _p(_tr(m), d);
  // tytuł strony
  document.title = _tr(document.title);
  // plakaty / karty rysowane na canvasie
  const _ft = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function(t, ...a) { return _ft.call(this, window._trOff ? t : _tr(t), ...a); };
  const _mt = CanvasRenderingContext2D.prototype.measureText;
  CanvasRenderingContext2D.prototype.measureText = function(t) { return _mt.call(this, window._trOff ? t : _tr(t)); };
  // daty po angielsku
  const _swap = l => (l === 'pl-PL' || l === 'pl') ? 'en-GB' : l;
  const _d = Date.prototype.toLocaleDateString, _s = Date.prototype.toLocaleString, _t = Date.prototype.toLocaleTimeString;
  Date.prototype.toLocaleDateString = function(l, o) { return _d.call(this, _swap(l), o); };
  Date.prototype.toLocaleString = function(l, o) { return _s.call(this, _swap(l), o); };
  Date.prototype.toLocaleTimeString = function(l, o) { return _t.call(this, _swap(l), o); };
}


function setLang(){return __lz(1,'setLang',this,arguments)}

// Apply language on load
function applyLangOnLoad() {
  // Update switcher buttons appearance without reload
  ['pl','en','nl'].forEach(l => {
    const btn = document.getElementById('lang-' + l);
    if(!btn) return;
    const active = l === currentLang;
    btn.style.background = active ? 'var(--accent)' : 'transparent';
    btn.style.color = active ? '#000' : 'var(--muted)';
    btn.style.borderColor = active ? 'var(--accent)' : 'var(--border)';
  });
  // Translate all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = (TRANSLATIONS[currentLang] || TRANSLATIONS.pl)[key] || (TRANSLATIONS.pl)[key];
    if(val) el.textContent = val;
  });
}

// ═══════════════════════════════════════════════════════════════
// DATA STORE
// ═══════════════════════════════════════════════════════════════
let matches = [];
let schedule = [];
let pendingScreenshots = [];
let events = [];
let discordUser = null; // { id, name, username, avatar, discordTag } — set after Discord OAuth // { id, title, type, status, description, date, maxPlayers, players, teams } // { id, url, author, timestamp, channelId, messageId } // planned matches
let aliases = JSON.parse(localStorage.getItem('nba2k_aliases') || '{}');
let teamAliases = JSON.parse(localStorage.getItem('nba2k_team_aliases') || '{}');
let rounds = []; // { id, label, from, to } // { "wrong": "correct" }
let seasons = [];
let playoffs = []; // array of playoff objects per season
let discordPsnMap = {}; // { discordName: psnName } — trwałe mapowania Discord→PSN
let ovrOverrides = {}; // { psnIngameName: overrideOvr } — ręczne nadpisania OVR przez admina
let teamRegistrations = []; // { id, seasonId, teamName, logo, captain, players[], registeredAt, status }
let ovrMethod = localStorage.getItem('nba2k_ovr_method') || 'classic'; // 'classic' | 'positional' | 'kw5' | 'top98'
let currentSeasonId = null;
// Public read credentials (embedded for all visitors)
// Read-only key (safe to hardcode - only Read permission, no Create/Update/Delete)
const PUBLIC_JB_READ_KEY = '$2a$10$s7x/.clV2lsU/yDDQAZ5nOVGQAAAQk3dJevLg7YYNphAObo0axoBK';
const PUBLIC_JB_BIN = '69a6c311ae596e708f5abaf8';

let jbKey = localStorage.getItem('nba2k_jb_key') || ''; // Master Key: admin only
let jbBin = localStorage.getItem('nba2k_jb_bin') || PUBLIC_JB_BIN;
let anthropicKey = localStorage.getItem('nba2k_anthropic_key') || '';
let workerUrl = EU_MODE ? (localStorage.getItem('nba2k_worker_url_eu') || EU_WORKER) : (localStorage.getItem('nba2k_worker_url') || 'https://kw5-elite-proxy.igor-bernakiewicz.workers.dev');
// 🌐 własny adres API ligi (api.chemikleagues.com / api-eu.chemikleagues.com): gdy odpowiada — strona przełącza się na niego; inaczej zostaje stary adres Workera
const API_DOMAIN = EU_MODE ? 'https://api-eu.chemikleagues.com' : 'https://api.chemikleagues.com';
if(!localStorage.getItem(EU_MODE ? 'nba2k_worker_url_eu' : 'nba2k_worker_url')) fetch(API_DOMAIN + '/ping', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => { if(j?.worker === 'nba2k-liga') workerUrl = API_DOMAIN; }).catch(() => {}); // tylko gdy odpowie nasz Worker
const _storedModel = localStorage.getItem('nba2k_ai_model') || '';
let aiModel = (_storedModel && _storedModel.includes('gemini') && _storedModel !== 'gemini-2.5-flash') ? 'gemini-2.5-flash' : (_storedModel || 'gemini-2.5-flash');
let discordWebhookUrl = localStorage.getItem('nba2k_discord_webhook') || '';
let discordTeamRegWebhookUrl = '';
let freeAgents = [];          // z Workera (osobny klucz KV)
let registrationsClosed = false; // zapisy drużyn zamknięte przez admina
let discordFreeAgentsWebhookUrl = ''; // kanał wolnych agentów (ustawiany przez admina)
let discordScheduleWebhookUrl = '';   // kanał ogłoszeń terminarza
let scheduleVoteCounts = {};  // { scheduleId: { team1, team2 } }
let myVotes = {};
let scheduleDayPicks = {};     // { scheduleId: { team1:{primary,backup}, team2:{...} } }
let typerData = {};            // ranking typerów (liczony w Workerze)
let awardsList = [];           // nagrody tygodnia
let myAwardVotes = {};         // { awardId: { kategoria: kandydat } }
let transfersList = [];        // transfery
let pendingResults = [];       // wyniki zgłoszone przez kapitanów, czekające na potwierdzenie
let powerRankings = [];        // power rankingi (zapisywane z danymi ligi)
let _dataLoadedAt = null;      // kiedy wczytano dane (chroni mecze dodane w międzyczasie przez Workera)             // { scheduleId: 'team1'|'team2' } — głosy zalogowanego użytkownika
let _regTab = 'fa';           // 'teams' | 'fa' — domyślnie wolni agenci
let _faPosFilter = ''; // osobny kanał dla zgłoszeń drużyn (zapisywany w danych ligi)
if(!localStorage.getItem('nba2k_recap_model_v2')) { localStorage.removeItem('nba2k_recap_model'); localStorage.setItem('nba2k_recap_model_v2', '1'); } // przejście na Gemini (darmowy klucz)
let recapModel = localStorage.getItem('nba2k_recap_model') || 'gemini-2.5-flash';
const MODEL_SCREENSHOT = () => aiModel;
const MODEL_CHEAP = () => aiModel.includes('gemini') ? 'gemini-2.5-flash' : (aiModel === 'claude-sonnet-4-20250514' ? 'claude-haiku-4-5-20251001' : aiModel);

// True if any AI backend is configured
function hasAI() { return !!(workerUrl || anthropicKey); }

function callAnthropic(){return __lz(2,'callAnthropic',this,arguments)}

function setScreenshotModel(){return __lz(2,'setScreenshotModel',this,arguments)}
let pendingMatch = null;
let screenshotBase64 = null;
let screenshotMimeType = 'image/jpeg';

function addAlias(){return __lz(2,'addAlias',this,arguments)}

function removeAlias(){return __lz(2,'removeAlias',this,arguments)}

function applyAliasesToAllMatches(){return __lz(2,'applyAliasesToAllMatches',this,arguments)}

function renderAliases(){return __lz(2,'renderAliases',this,arguments)}

// ═══ 🏀 Fantasy: ceny, pozycje i punkty zawodników liczone w przeglądarce admina (Worker liczy tylko ranking) ═══
const _FXB = { lastN: 10, newPrice: 5, minPrice: 4, maxPrice: 15 };
const _FX_GRADE = { 'A+': 3, 'A': 2.5, 'A-': 2, 'B+': 1.5, 'B': 1, 'B-': 0.5, 'C+': 0, 'C': -0.5, 'C-': -1, 'D+': -1.25, 'D': -1.5, 'D-': -1.75, 'F': -2 };
const _FX_POSSET = new Set(['PG', 'SG', 'SF', 'PF', 'C']);
function _fxNormPos(x) {
  let v = String(x || '').trim().toUpperCase().split(/[\/,\s]/)[0];
  v = { '1': 'PG', '2': 'SG', '3': 'SF', '4': 'PF', '5': 'C', 'CE': 'C', 'CENTER': 'C' }[v] || v;
  return _FX_POSSET.has(v) ? v : '';
}
function _fxPoints(p, won) {
  let fp = p.pts + p.reb * 1.2 + p.ast * 1.5 + p.stl * 3 + p.blk * 3 - p.to + (won ? 2 : 0);
  const tens = [p.pts, p.reb, p.ast, p.stl, p.blk].filter(x => x >= 10).length;
  fp += tens >= 3 ? 5 : tens >= 2 ? 3 : 0;
  fp += _FX_GRADE[String(p.grade || '').trim().toUpperCase()] ?? 0;
  return Math.round(fp * 10) / 10;
}
function _fxPrice(games) {
  if(!games.length) return _FXB.newPrice;
  const last = games.slice(-_FXB.lastN);
  let sw = 0, s = 0;
  last.forEach((g, i) => { const w = i + 1; sw += w; s += w * g.fp; });
  let avg = s / sw;
  if(last.length < 3) avg = (avg * last.length + 18 * (3 - last.length)) / 3;
  return Math.max(_FXB.minPrice, Math.min(_FXB.maxPrice, Math.round((4 + (avg - 8) * 0.27) * 2) / 2));
}
function _fxBuild() {
  const sid = currentSeasonId || null;
  const wk = {};
  (schedule || []).filter(s => s.generated && (s.seasonId || null) === sid && s.week && s.weekStart).forEach(s => { if(!wk[s.week] || s.weekStart < wk[s.week]) wk[s.week] = s.weekStart; });
  const weeks = Object.entries(wk).map(([w, ws]) => ({ week: +w, weekStart: ws })).sort((a, b) => a.week - b.week);
  if(!weeks.length) return null;
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' });
  const started = weeks.filter(w => w.weekStart <= today);
  const current = started[started.length - 1] || null;
  const priceCut = (current || weeks[0]).weekStart;
  const prevCut = current ? (started[started.length - 2]?.weekStart || _ssAddDays(current.weekStart, -7)) : null;
  // nicki ze składów zatwierdzonych drużyn sezonu
  const rosterTeam = {};
  teamRegistrations.filter(r => r.status === 'approved' && (!r.seasonId || r.seasonId === sid)).forEach(r => (r.players || []).forEach(p => { const k = _normNick(p.gamertag); if(k) rosterTeam[k] = { team: r.teamName, name: p.gamertag }; }));
  const rosterKeys = Object.keys(rosterTeam), cache = {};
  const canon = k => { if(rosterTeam[k] || k.length < 5) return k; if(k in cache) return cache[k]; const hit = rosterKeys.find(r => r.length >= 5 && _lev(r, k) <= 1); return (cache[k] = hit || k); };
  // występy (bieżąca + poprzednia edycja — do cen; pozycje: najpierw bieżący sezon)
  const eds = new Set(_editionsList().slice(0, 2));
  const games = [];
  _withAllMatches(() => matches.slice()).filter(m => !m.walkover && eds.has(_editionOf(m.seasonId))).forEach(m => {
    const s1 = +m.team1?.score || 0, s2 = +m.team2?.score || 0;
    [[m.team1, s1 > s2], [m.team2, s2 > s1]].forEach(([t, won]) => (t?.players || []).forEach(raw => {
      const key = canon(_normNick(raw.name)); if(!key) return;
      const p = { pts: +raw.pts || 0, reb: +raw.reb || 0, ast: +raw.ast || 0, stl: +raw.stl || 0, blk: +raw.blk || 0, to: +raw.to || 0, grade: raw.grade };
      games.push({ key, name: raw.name, team: t.name, date: m.date || '', seasonId: m.seasonId || null, fp: _fxPoints(p, won), pos: _fxNormPos(raw.pos), mid: m.id });
    }));
  });
  games.sort((a, b) => String(a.date).localeCompare(String(b.date)) || (+a.mid - +b.mid));
  const byKey = {};
  games.forEach(g => (byKey[g.key] = byKey[g.key] || []).push(g));
  const pool = new Set([...rosterKeys, ...games.filter(g => g.seasonId === sid).map(g => g.key)]);
  const players = [...pool].map(key => {
    const all = byKey[key] || [], season = all.filter(g => g.seasonId === sid), lastS = season[season.length - 1];
    const team = rosterTeam[key]?.team || lastS?.team || '';
    const name = rosterTeam[key]?.name || lastS?.name || all[all.length - 1]?.name || key;
    const before = c => all.filter(g => g.date < c);
    const recent = all.slice(-_FXB.lastN);
    const seasonPos = season.filter(g => g.pos), withPos = seasonPos.length ? seasonPos.slice(-20) : all.slice(-20).filter(g => g.pos);
    const pc = {}; withPos.forEach(g => { pc[g.pos] = (pc[g.pos] || 0) + 1; });
    return { key, name, team,
      price: _fxPrice(before(priceCut)), prevPrice: prevCut ? _fxPrice(before(prevCut)) : _fxPrice(before(priceCut)),
      avg: recent.length ? Math.round(recent.reduce((s, g) => s + g.fp, 0) / recent.length * 10) / 10 : 0,
      gp: season.length, last: lastS ? lastS.fp : null,
      pos: Object.entries(pc).filter(([, n]) => n / withPos.length >= 0.25).sort((a, b) => b[1] - a[1]).map(x => x[0]) };
  }).filter(p => p.team).sort((a, b) => b.price - a.price || b.avg - a.avg);
  // punkty zawodników w rozpoczętych tygodniach
  const weekFp = {};
  started.forEach(w => {
    const end = _ssAddDays(w.weekStart, 7), o = weekFp[w.week] = {};
    games.filter(g => g.seasonId === sid && g.date >= w.weekStart && g.date < end).forEach(g => { o[g.key] = Math.round(((o[g.key] || 0) + g.fp) * 10) / 10; });
  });
  return { seasonId: sid, weeks, players, weekFp, pricesAt: priceCut };
}

function _externalizeLogos(){return __lz(2,'_externalizeLogos',this,arguments)}
// Dane pochodne (terminy, typer, playoffy, ustawienia) liczone przez Workera z lekkiej wersji danych
async function _pushDerived() {
  if(!workerUrl || !_isLoggedInSync()) return;
  try {
    const all = _withAllMatches(() => matches.slice());
    const byId = new Map(all.map(m => [String(m.id), m]));
    const cut = (playoffs || []).map(po => po.startDate || String(po.createdAt || '').slice(0, 10) || '0000-00-00').sort()[0];
    const need = new Set();
    (schedule || []).forEach(s => (Array.isArray(s.matchIds) ? s.matchIds : s.matchId ? [s.matchId] : []).forEach(id => need.add(String(id))));
    if(cut) all.forEach(m => { if(m.date >= cut) need.add(String(m.id)); });
    const lite = m => ({ id: m.id, date: m.date, seasonId: m.seasonId || null, team1: { name: m.team1?.name, score: m.team1?.score }, team2: { name: m.team2?.name, score: m.team2?.score } });
    const body = {
      schedule: (schedule || []).map(s => { const { prediction, ...rest } = s; return rest; }),
      matches: [...need].map(id => byId.get(id)).filter(Boolean).map(lite),
      playoffs: (playoffs || []).map(po => ({ id: po.id, seasonId: po.seasonId || null, format: po.format, startDate: po.startDate || null, createdAt: po.createdAt || null, champion: po.champion || null, rounds: po.rounds || [] })),
      registrationsClosed, rosterLockDate, currentSeasonId, seasons,
      fantasyPre: (() => { try { return _fxBuild(); } catch(e) { console.warn('fxBuild', e); return null; } })(),
      botSnap: (() => { try { return _botSnap(); } catch(e) { console.warn('botSnap', e); return null; } })(),
      discordGuildId: discordRoleCfg.guildId, discordMemberRoleId: discordRoleCfg.member, discordCaptainRoleId: discordRoleCfg.captain
    };
    await _api('/derived', 'POST', body, { admin: true });
    try { const ex = await _api('/extras', 'GET', null, {}); if(ex?.fantasy) { fantasyData = ex.fantasy; if(document.getElementById('view-fantasy')?.classList.contains('active')) renderFantasy(); } } catch(e) {}
    // stare logotypy zgłoszeń drużyn → osobne obrazki (po kilka naraz)
    for(let i = 0; i < 6; i++) { const r = await _api('/logo-migrate', 'POST', {}, { admin: true }); if(!r.ok || !r.remaining) break; }
  } catch(e) { console.warn('pushDerived', e); }
}


// ═══ 🎪 EVENTY W OSOBNYM KLUCZU (/events) — event manager nie potrzebuje dostępu do bazy ligi ═══
let _eventsStore = false, _eventsSavedJson = null;
async function _loadEventsStore() {
  if(!workerUrl) return;
  try {
    const r = await _api('/events', 'GET', null, {});
    if(!r.ok) return;
    if(Array.isArray(r.events)) {
      events = r.events; _eventsStore = true; _eventsSavedJson = JSON.stringify(events);
      try { _evsMerge(window._lastEventSignups); } catch(e) {}
    } else if(_isEventsAdminSync() && (events || []).length) {
      // jednorazowe przeniesienie eventów z bazy ligi do osobnego klucza
      const m = await _saveEvents(true); if(m) { _eventsStore = true; showToast('🎪 Eventy przeniesione do osobnego zapisu', 'success'); }
    } else if(_isEventsAdminSync()) { _eventsStore = true; }
    if(typeof renderEvents === 'function') renderEvents();
    if(typeof renderEventsDashboard === 'function') renderEventsDashboard();
  } catch(e) { console.warn('events store', e); }
}
function _saveEvents(){return __lz(2,'_saveEvents',this,arguments)}
function _isFullAdmin(){return __lz(2,'_isFullAdmin',this,arguments)}
function _eventsViaDiscord(){return __lz(2,'_eventsViaDiscord',this,arguments)}

function saveData(){return __lz(2,'saveData',this,arguments)}

async function loadData() {
  try {
    showGlobalLoader(true);
    let record = null;

    // ── Load config (webhook URL etc.) from Worker KV ─────────────────────
    if(workerUrl) {
      try {
        const cfgRes = await fetch(workerUrl.replace(/\/$/, '') + '/config');
        if(cfgRes.ok) {
          const cfg = await cfgRes.json();
          if(cfg.discordWebhookUrl) {
            discordWebhookUrl = cfg.discordWebhookUrl;
            localStorage.setItem('nba2k_discord_webhook', discordWebhookUrl);
          }
        }
      } catch(e) { /* config fetch failed, keep localStorage value */ }
    }

    // ── Primary: Cloudflare KV via Worker ────────────────────────────────
    if(workerUrl) {
      const base = workerUrl.replace(/\/$/, '');
      // Dane dodatkowe (zgłoszenia, agenci, głosy, typer…) z lekkiego endpointu — równolegle
      const extrasP = fetch(base + '/extras').then(r => r.ok ? r.json() : null).catch(() => null);
      const res = await fetch(base + '/data');
      if(res.ok) {
        const data = await res.json();
        const rec0 = data.record || (data.matches ? data : null);
        if(rec0) {
          record = rec0;
          window._dataLoadedAt = record._savedAt || Date.now();
          const extras = await extrasP;
          if(extras && !extras.error) Object.assign(record, extras);
          window._needDerived = !!(extras && !extras.error && (!extras.derivedAt || ((!extras.fantasy || (extras.fantasy.rules?.v || 0) < 5 || !extras.botSnapAt || !extras.fantasy.players?.some(p => p.pos?.length)) && (record.schedule || []).some(x => x.generated))));
        }
      }
    }

    // ── Fallback / Migration source: JSONBin ─────────────────────────────
    if(!record && jbBin && !EU_MODE) { // liga EU nigdy nie bierze zapasowej bazy ligi PL
      const headers = { 'Content-Type': 'application/json' };
      if(jbKey) headers['X-Master-Key'] = jbKey;
      else headers['X-Access-Key'] = PUBLIC_JB_READ_KEY;
      const res = await fetch(`https://api.jsonbin.io/v3/b/${jbBin}/latest`, { headers });
      if(res.ok) {
        const data = await res.json();
        record = data.record;
        // ── Auto-migrate JSONBin → KV if Worker configured ────────────────
        if(workerUrl && jbKey && record) {
          console.log('Migrating data from JSONBin to Cloudflare KV...');
          // Will be saved to KV on next saveData() call
          showToast('📦 Migracja danych do Cloudflare KV...', 'info');
          setTimeout(() => saveData().then(() =>
            showToast('✅ Migracja zakończona — dane w Cloudflare KV!', 'success')
          ), 1000);
        }
      }
    }

    if(!record) { showGlobalLoader(false); if(EU_MODE) showToast('⚠️ Cannot load EU league data — check the EU Worker (DATA_KV binding).', 'error'); return; }

    // ── Unpack data ───────────────────────────────────────────────────────
    const unpackPlayer = p => {
      if(p.name !== undefined) return p;
      return {
        name: p.n||'', grade: p.g||'B', pos: p.po||'',
        pts:p.p||0, reb:p.r||0, ast:p.a||0, stl:p.s||0, blk:p.b||0,
        to:p.t||0, fgm:p.fm||0, fga:p.fa||0, tpm:p.tm||0, tpa:p.ta||0,
        ftm:p.xm||0, fta:p.xa||0, fol:p.f||0
      };
    };
    const unpackTeam = t => ({
      ...t,
      quarters: t.q ? t.q.split(',').map(Number) : (t.quarters||[]),
      players: (t.players||[]).map(unpackPlayer)
    });
    const rawMatches = record.matches || [];
    matches = rawMatches.map(m => ({
      ...m,
      team1: unpackTeam(m.team1||{}),
      team2: unpackTeam(m.team2||{})
    }));
    aliases          = record.aliases || {};
    seasons          = record.seasons || [];
    currentSeasonId  = record.currentSeasonId || null;
    schedule         = record.schedule || [];
    teams            = record.teams || {};
    rounds           = record.rounds || [];
    pendingScreenshots = record.pendingScreenshots || [];
    window._challengesOff = !!record.challengesOff;
    window._emojiMap = record.emojiMap || {};
    window._teamRoles = record.teamRoles || {};
    window._dj = record.dj || null; try { djMount(); } catch(e) {}
    window._xEditors = record.xEditors || [];
    window._rivalryNames = record.rivalryNames || {};
    try { _moveJoinSection(); _dashLayout(); } catch(e) { console.warn('dash layout', e); }
    setTimeout(() => { try { if(EU_MODE) renderEuDash(); else renderDashNews(); renderRecordsTicker(); renderEuBillboard(); } catch(e) { console.warn('dash news', e); } }, 300);
    if(EU_MODE) [1500, 4000].forEach(t => setTimeout(() => { try { _euPlaceholders(); } catch(e) {} }, t)); // puste sekcje widoczne także po przerysowaniu terminarza
    window._discordInviteUrl = record.discordInvite || null;
    window._signupInfo = record.signup || {}; window._signupLoaded = true; window._leagueLoaded = true;
    try { if(document.querySelector('.view.active')?.id === 'view-kort') setTimeout(renderKort, 50); } catch(e) {}
    try { if(document.querySelector('.view.active')?.id === 'view-rules') renderRules(); } catch(e) {}
    if(window._discordInviteUrl) document.querySelectorAll('a[href*="discord.gg/"]').forEach(a => { a.href = window._discordInviteUrl; });
    setTimeout(() => { try { renderSideNav(); } catch(e) { console.warn('side nav', e); } }, 50);
    setTimeout(() => { try { _captainXNudge(); } catch(e) {} }, 1500);
    setTimeout(() => { try { _dailyRefresh(); } catch(e) {} }, 1200);
    events = record.events || []
    window._lastEventSignups = record.eventSignups || {};
    try { _evsMerge(record.eventSignups); } catch(e) { console.warn('evsMerge', e); }
    _loadEventsStore();
    playoffs = record.playoffs || [];;
    discordPsnMap = record.discordPsnMap || {};
    ovrOverrides = record.ovrOverrides || {};
    teamRegistrations = record.teamRegistrations || [];
    discordTeamRegWebhookUrl = record.discordTeamRegWebhookUrl || '';
    freeAgents = record.freeAgents || [];
    registrationsClosed = !!record.registrationsClosed;
    discordFreeAgentsWebhookUrl = record.discordFreeAgentsWebhookUrl || '';
    discordScheduleWebhookUrl = record.discordScheduleWebhookUrl || '';
    scheduleVoteCounts = record.scheduleVoteCounts || {};
    reactionsData = record.reactions || reactionsData || {};
    predictionsData = record.predictions || predictionsData || {};
    scheduleDayPicks = record.scheduleDayPicks || {};
    typerData = record.typer || {};
    awardsList = record.awards || [];
    transfersList = record.transfers || [];
    pendingResults = record.pendingResults || [];
    powerRankings = record.powerRankings || [];
    bracketData = record.bracket || {};
    playersList = record.players || [];
    streamsData = record.streams || {};
    clipsList = record.clips || [];
    window._interviews = record.interviews || {};
    window._launch = record.launch || window._launch || {};
    window._totwPub = record.totwPub || {}; // opublikowane Piątki tygodnia (jak w podcaście i kartach limitowanych)
    penalties = record.penalties || [];
    rosterLockDate = record.rosterLockDate || null;
    discordRoleCfg = { guildId: record.discordGuildId || '', member: record.discordMemberRoleId || '', captain: record.discordCaptainRoleId || '' };
    teamAliasMap = record.teamAliasMap || {};
    fantasyData = record.fantasy || null;
    _dataLoadedAt = new Date().toISOString();
    _loadMyVotes();
    if(record.ovrMethod) { ovrMethod = record.ovrMethod; localStorage.setItem('nba2k_ovr_method', ovrMethod); }
    // Fix playoffs with missing startDate — use createdAt date as fallback
    playoffs.forEach(po => {
      if (!po.startDate && po.createdAt) {
        po.startDate = po.createdAt.slice(0, 10);
      }
    });

    // Logos now stored in KV with teams data

    window.teams = teams;
    localStorage.setItem('nba2k_aliases', JSON.stringify(aliases));

    // Auto-assign matches without seasonId
    if(currentSeasonId) {
      let _changed = 0;
      matches.forEach(m => { if(!m.seasonId) { m.seasonId = currentSeasonId; _changed++; } });
      if(_changed > 0) saveData();
    }
    renderDashboard();
    updateAuthUI();
    updateMatchFilters();
    populateTeamFilter();
    checkDraftWatchParam();

  } catch(e) {
    console.error('Load error:', e);
    showToast('❌ Błąd ładowania danych: ' + e.message, 'error');
  } finally {
    showGlobalLoader(false);
  }
}
function showGlobalLoader(show) {
  let el = document.getElementById('global-loader');
  if(el) el.style.display = show ? 'flex' : 'none';
}

function showToast(msg, type='info') {
  let toast = document.getElementById('toast');
  if(!toast) return;
  toast.textContent = msg;
  toast.className = 'toast toast-' + type + ' show';
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function fixAllMatchesWithAliases(){return __lz(2,'fixAllMatchesWithAliases',this,arguments)}

function saveAliases(){return __lz(2,'saveAliases',this,arguments)}

// Apply aliases to a name
function applyAlias(name) {
  const key = name.trim().toLowerCase();
  for(const [wrong, correct] of Object.entries(aliases)) {
    if(wrong.toLowerCase() === key) return correct;
  }
  return name;
}

function applyAliasesToMatch(){return __lz(2,'applyAliasesToMatch',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════

// 🔗 ADRESY ZAKŁADEK — pasek adresu pokazuje bieżącą zakładkę (PL po polsku, EU po angielsku; oba warianty rozpoznawane)
const _VIEW_SLUG = { events: ['eventy', 'events'], matches: ['mecze', 'games'], stats: ['statystyki', 'stats'], 'add-match': ['dodaj-mecz', 'add-game'], mypanel: ['panel', 'panel'], kort: ['kort', 'kort'], rules: ['regulamin', 'rules'],
  join: ['zapisy', 'join'], standings: ['tabela', 'standings'], awards: ['nagrody', 'awards'], totw: ['piatka-tygodnia', 'team-of-the-week'], fplus: ['fantasy-plus', 'fantasy-plus'], cards: ['kolekcja', 'cards'], gm: ['liga-gm', 'gm-league'],
  fans: ['kibice', 'fans'], kordle: ['2kordle', '2kordle'], podcast: ['podcast', 'podcast'], multistream: ['multistream', 'multistream'], teams: ['druzyny', 'teams'], fantasy: ['fantasy', 'fantasy'], schedule: ['terminarz', 'schedule'], privacy: ['prywatnosc', 'privacy'], howto: ['jak-to-dziala', 'how-it-works'] };
const _urlOn = () => /^https?:$/.test(location.protocol);
function _viewUrl(v) { const s = _VIEW_SLUG[v]; return '/' + (s ? s[EU_MODE ? 1 : 0] : '') + location.search; }
function _viewOfSlug(h) { h = String(h || '').toLowerCase(); for(const [v, s] of Object.entries(_VIEW_SLUG)) if(s.includes(h)) return v; return null; }
function _modalUrl(){return __lz(2,'_modalUrl',this,arguments)}

function showView(id) {
  try { _sideSync(id); } catch(e) {}
  try { if(window._navReady && !window._navFromPop) { const cur = (document.querySelector('.view.active')?.id || '').replace(/^view-/, ''); if(cur && cur !== id) history.pushState({ v: id }, '', _urlOn() ? _viewUrl(id) : location.pathname + location.search); } } catch(e) {}
  // link z adresu (np. #multistream, #kolekcja) obsłużony — przy przejściu na inny widok czyścimy adres, żeby odświeżenie nie wracało do linku
  try { const h = location.hash.replace('#', ''); if(h && !h.startsWith('bin=') && !h.startsWith('{') && window._routeHandled && h !== id) history.replaceState(history.state, '', location.pathname + location.search); } catch(e) {}
  try { _gmNavSync(); } catch(e) {}
  if(id === 'gm' && typeof _gmVisible === 'function' && !_gmVisible() && !window._gmDemo) id = 'dashboard'; // demo Ligi GM działa też przed startem ligi
  if(id==='schedule') { setTimeout(renderSchedule, 50); }
  if(id==='events') { setTimeout(renderEvents, 50); }
  if(id==='totw') setTimeout(renderTotw, 30);
  if(id==='rules') setTimeout(renderRules, 30);
  if(id==='kort') setTimeout(renderKort, 30);
  if(id==='fplus') setTimeout(renderFantasyPlus, 30);
  if(id==='awards') setTimeout(() => { try { renderAwardsDashboard(); renderAwardsView(); } catch(e) {} }, 30);
  if(id==='join') setTimeout(() => { try { _moveJoinSection(); renderTeamRegistrations(); } catch(e) {} }, 30);
  if(id==='add-match') { setTimeout(initWalkoverTeams, 50); setTimeout(()=>setScreenshotModel(aiModel||'gemini-2.5-flash'), 50); setTimeout(initDiscordQueue, 100); }
  if(PROTECTED_VIEWS.includes(id)) {
    isLoggedIn().then(logged => {
      if(!logged) {
        pendingAuthView = id;
        document.getElementById('login-input').value = '';
        document.getElementById('login-error').textContent = '';
        document.getElementById('auth-modal').classList.add('open');
        setTimeout(() => document.getElementById('login-input').focus(), 100);
      } else {
        _doShowView(id);
      }
    });
    return;
  }
  _doShowView(id);
}

function _doShowView(){return __lz(2,'_doShowView',this,arguments)}

function handleFileSelect(){return __lz(2,'handleFileSelect',this,arguments)}

// Drag and drop
const uploadZone = document.getElementById('upload-zone');
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if(file) {
    const input = document.getElementById('screenshot-input');
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    handleFileSelect(input);
  }
});

function parseScreenshot(){return __lz(2,'parseScreenshot',this,arguments)}

function renderParsedPreview(){return __lz(2,'renderParsedPreview',this,arguments)}

function renderTeamTable(){return __lz(2,'renderTeamTable',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// SAVE MATCH
// ═══════════════════════════════════════════════════════════════
function saveMatch() {
  if(!pendingMatch) return;
  if(currentSeasonId) pendingMatch.seasonId = currentSeasonId;
  try {
    const fx = _fixMatchTeams(pendingMatch);
    const nf = _fixPlayerNames(pendingMatch);
    if(nf.length) pendingMatch.nameFixes = nf;
    const msg = [...fx.map(f => `${f.from} → ${f.to}`), ...(nf.length ? [`${nf.length} ${_plPL(nf.length, 'nick poprawiony', 'nicki poprawione', 'nicków poprawionych')} wg składów`] : [])];
    if(msg.length) showToast('🔄 ' + msg.join(' · '), 'info');
  } catch(e) {}
  const _savedMatch = pendingMatch;
  matches.unshift(_savedMatch);
  pendingMatch = null;
  // Remove processed screenshot from Worker KV queue
  if(window._currentDiscordScreenshot) {
    const s = window._currentDiscordScreenshot;
    window._currentDiscordScreenshot = null;
    if(workerUrl && s.id) {
      const adminToken = localStorage.getItem('nba2k_admin_token_hash') || '';
      fetch(workerUrl.replace(/\/$/, '') + '/pending-screenshots/' + encodeURIComponent(s.id), {
        method: 'DELETE',
        headers: { 'X-Admin-Token': adminToken }
      }).catch(() => {});
    }
    // Also remove from local array
    const li = pendingScreenshots.findIndex(x => x.id === s.id);
    if(li !== -1) pendingScreenshots.splice(li, 1);
  }
  saveData().then(() => {
    showToast('✅ Mecz zapisany!', 'success');
    try {
      const names = new Set([_savedMatch.team1, _savedMatch.team2].flatMap(t => (t.players || []).map(p => _normNick(p.name))));
      const history = _withAllMatches(() => matches.filter(x => x !== _savedMatch && !x.walkover)).map(x => ({ id: x.id, date: x.date,
        team1: { name: x.team1.name, score: x.team1.score, players: (x.team1.players || []).filter(p => names.has(_normNick(p.name))).map(p => ({ n: p.name, p: p.pts || 0 })) },
        team2: { name: x.team2.name, score: x.team2.score, players: (x.team2.players || []).filter(p => names.has(_normNick(p.name))).map(p => ({ n: p.name, p: p.pts || 0 })) } }))
        .filter(x => x.team1.players.length || x.team2.players.length);
      _api('/achievements/announce', 'POST', { match: _savedMatch, history }, { admin: true }).catch(() => {});
    } catch(e) {}
    sendMatchWebhook(_savedMatch);
    if(hasAI()) {
      setStatus('success', t('match_saved_recap'));
      generateRecap(_savedMatch.id).then(() => {
        setStatus('success', '🎉 Mecz zapisany z recapem!');
      });
    } else {
      setStatus('success', t('match_saved_simple'));
    }
  });
  clearForm();
  document.getElementById('parsed-result').style.display = 'none';
  // If screen came from Discord queue, reload page to clear the queue panel
  const wasDiscord = !!window._discordScreenshotWasUsed;
  window._discordScreenshotWasUsed = false;
  if(wasDiscord) {
    setTimeout(() => location.reload(), 1500);
  } else {
    setTimeout(() => showView('matches'), hasAI() ? 3500 : 1500);
  }
}

function clearForm(){return __lz(2,'clearForm',this,arguments)}


// ═══════════════════════════════════════════════════════════════
// TEAM LOGO HELPERS
// ═══════════════════════════════════════════════════════════════
function teamColor(name) {
  // Deterministic color from team name
  const COLORS = [
    '#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c',
    '#3498db','#9b59b6','#e91e63','#00bcd4','#ff5722',
    '#8bc34a','#607d8b','#ff9800','#795548','#673ab7'
  ];
  let hash = 0;
  for(let i=0;i<name.length;i++) hash = name.charCodeAt(i) + ((hash<<5)-hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}
function teamInitials(name) {
  const words = name.trim().split(/\s+/);
  if(words.length >= 2) return (words[0][0] + words[words.length-1][0]).toUpperCase();
  return name.substring(0,2).toUpperCase();
}
function teamLogo(name, size=40, fontSize='1rem') {
  const _regLogo = typeof teamRegistrations !== 'undefined'
    ? teamRegistrations.find(r => r.logo && r.status !== 'rejected' && String(r.teamName).toLowerCase() === String(name).toLowerCase())?.logo : null;
  const _src = _regLogo || (typeof teams !== 'undefined' && teams[name]?.logo) || null;
  if(_src)
    return `<img src="${_src}" alt="" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid var(--border)">`;
  const color = teamColor(name);
  const initials = teamInitials(name);
  return `<div style="width:${size}px;height:${size}px;border-radius:8px;background:${color};display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:${fontSize};color:#fff;flex-shrink:0;letter-spacing:1px;text-shadow:0 1px 2px rgba(0,0,0,.4)">${initials}</div>`;
}

// ═══════════════════════════════════════════════════════════════
// RENDER MATCHES
// ═══════════════════════════════════════════════════════════════
function updateMatchFilters() {
  const ss=document.getElementById('mfs');
  if(ss){
    const cs=ss.value;
    ss.innerHTML=('<option value="">'+t('all_seasons')+'</option>')+seasons.map(s=>`<option value="${s.id}"${s.id===cs?' selected':''}>${s.name}</option>`).join('');
  }
  const ts=document.getElementById('mft'),ps=document.getElementById('mfp');
  if(!ts||!ps)return;
  const teams=[...new Set(matches.flatMap(m=>[m.team1.name,m.team2.name]))].sort();
  const players=[...new Set(matches.flatMap(m=>[...(m.team1.players||[]),...(m.team2.players||[])].map(p=>p.name)))].sort();
  const ct=ts.value,cp=ps.value;
  ts.innerHTML=('<option value="">'+t('all_teams')+'</option>')+teams.map(tn=>`<option value="${tn}"${tn===ct?' selected':''}>${tn}</option>`).join('');
  ps.innerHTML=('<option value="">'+t('all_players')+'</option>')+players.map(p=>`<option value="${p}"${p===cp?' selected':''}>${p}</option>`).join('');
}
function renderMatches(){return __lz(2,'renderMatches',this,arguments)}

function openMatch(){return __lz(2,'openMatch',this,arguments)}

function buildPlayerTable(players, teamName) {
  if(!players?.length) return '<p style="color:var(--muted);padding:1rem">Brak danych</p>';
  const rows = players.map(p => {
    const fgPct = (p.fga||0) > 0 ? Math.round((p.fgm||0)/(p.fga||0)*100) : 0;
    const tpPct = (p.tpa||0) > 0 ? Math.round((p.tpm||0)/(p.tpa||0)*100) : 0;
    const ftPct = (p.fta||0) > 0 ? Math.round((p.ftm||0)/(p.fta||0)*100) : 0;
    const safeName = (p.name||'').replace(/'/g,"\'");
    const safeTeam = (teamName||'').replace(/'/g,"\'");
    return `<tr>
      <td><span onclick="event.stopPropagation();openPlayerModal('${safeName}','${safeTeam}')" style="cursor:pointer;border-bottom:1px dashed var(--muted);padding-bottom:1px;transition:color 0.15s" onmouseover="this.style.color='var(--accent)';this.style.borderColor='var(--accent)'" onmouseout="this.style.color='';this.style.borderColor='var(--muted)'">${p.name}</span></td>
      <td><span class="grade grade-${(p.grade||'B').replace('+','p').replace('-','m')}">${p.grade||'B'}</span></td>
      <td>${p.pts||0}</td><td>${p.reb||0}</td><td>${p.ast||0}</td><td>${p.stl||0}</td><td>${p.blk||0}</td>
      <td>${p.fol||p.fouls||0}</td><td>${p.to||0}</td>
      <td>${p.fgm||0}/${p.fga||0} <span style="color:var(--muted);font-size:0.75rem">${fgPct}%</span></td>
      <td>${p.tpm||0}/${p.tpa||0} <span style="color:var(--muted);font-size:0.75rem">${tpPct}%</span></td>
      <td>${p.ftm||0}/${p.fta||0} <span style="color:var(--muted);font-size:0.75rem">${ftPct}%</span></td>
    </tr>`;
  }).join('');
  return `<div class="stats-table-wrap"><table>
    <thead><tr>
      <th style="text-align:left">${t('th_player')}</th><th>GRD</th>
      <th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th>
      <th>FOL</th><th>TO</th><th>FG</th><th>3P</th><th>FT</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

function switchTab(){return __lz(2,'switchTab',this,arguments)}

function closeModal(){return __lz(2,'closeModal',this,arguments)}

let pendingDeleteId = null;

// 🔌 MECZ PRZERWANY (rozłączenie): połączenie dwóch zrzutów w jeden mecz — suma wyniku i statystyk; da się rozdzielić z powrotem
const _MSUM = ['pts', 'reb', 'ast', 'stl', 'blk', 'to', 'fgm', 'fga', 'tpm', 'tpa', 'ftm', 'fta'];
function _numToGrade(){return __lz(2,'_numToGrade',this,arguments)}
function _mergeTeams(){return __lz(2,'_mergeTeams',this,arguments)}
function openMergeMatch(){return __lz(2,'openMergeMatch',this,arguments)}
function mergeMatchesConfirm(){return __lz(2,'mergeMatchesConfirm',this,arguments)}
function unmergeMatch(){return __lz(2,'unmergeMatch',this,arguments)}

function deleteMatch(){return __lz(2,'deleteMatch',this,arguments)}

function confirmDelete(){return __lz(2,'confirmDelete',this,arguments)}

function closeConfirm(){return __lz(2,'closeConfirm',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// STATS VIEW
// ═══════════════════════════════════════════════════════════════
// Convert grade string to numeric value
function gradeToNum(g) {
  const map = {'A+':13,'A':12,'A-':11,'B+':10,'B':9,'B-':8,'C+':7,'C':6,'C-':5,'D+':4,'D':3,'D-':2,'F':1};
  return map[(g||'').toUpperCase()] || 0;
}
function numToGrade(n) {
  if(n>=12.5) return 'A+'; if(n>=11.5) return 'A'; if(n>=10.5) return 'A-';
  if(n>=9.5) return 'B+'; if(n>=8.5) return 'B'; if(n>=7.5) return 'B-';
  if(n>=6.5) return 'C+'; if(n>=5.5) return 'C'; if(n>=4.5) return 'C-';
  if(n>=3.5) return 'D+'; if(n>=2.5) return 'D'; if(n>=1.5) return 'D-';
  return 'F';
}

function getAggregatedStats(seasonFilter, includePlayoff = false) {
  const po = playoffs.length ? playoffs[playoffs.length-1] : null;
  const _poAgg = playoffs.length ? playoffs[playoffs.length-1] : null;
  const _poAggPairs = new Set(
    (_poAgg ? _poAgg.rounds : []).flatMap(r => r.pairs.map(p => [p.team1, p.team2].sort().join('|')))
  );
  const _poAggCutoff = _poAgg ? (_poAgg.startDate || (_poAgg.createdAt || '').slice(0,10) || '0000-00-00') : null;
  const isPlayoffMatch = m => _isAnyPlayoffMatch(m);
  const playerMap = {};
  matches.filter(m => {
    if (seasonFilter && m.seasonId !== seasonFilter) return false;
    if (!includePlayoff && isPlayoffMatch(m)) return false;
    return true;
  }).forEach(m => {
    [m.team1, m.team2].forEach(team => {
      (team.players || []).forEach(p => {
        const key = p.name + '|' + team.name;
        if(!playerMap[key]) playerMap[key] = { name: p.name, team: team.name, pos: p.pos||'', posCounts:{}, gp: 0, pts:0, reb:0, ast:0, stl:0, blk:0, to:0, fgm:0, fga:0, tpm:0, tpa:0, ftm:0, fta:0, gradeSum:0 };
        const s = playerMap[key];
        s.gp++; s.pts+=(p.pts||0); s.reb+=(p.reb||0); s.ast+=(p.ast||0); s.stl+=(p.stl||0); s.blk+=(p.blk||0);
        s.to+=(p.to||0); s.fgm+=(p.fgm||0); s.fga+=(p.fga||0); s.tpm+=(p.tpm||0); s.tpa+=(p.tpa||0); s.ftm+=(p.ftm||0); s.fta+=(p.fta||0);
        s.gradeSum += gradeToNum(p.grade||'B');
      });
    });
  });
  return Object.values(playerMap);
}

function populateTeamFilter() {
  // Populate round filter
  const rsel = document.getElementById('filter-round-stats');
  if(rsel) {
    const curR = rsel.value;
    const allRounds = rounds.length ? rounds : [getDefaultRound()];
    rsel.innerHTML = '<option value="">Wszystkie kolejki</option>' +
      allRounds.map(r => `<option value="${r.id}"${r.id===curR?' selected':''}>${r.label}</option>`).join('');
    // Default to active round if nothing selected
    if(!curR) {
      const active = getCurrentRound();
      if(active) rsel.value = active.id || '';
    }
  }
  const sel = document.getElementById('filter-team');
  const teams = [...new Set(matches.flatMap(m => [m.team1.name, m.team2.name]))];
  const current = sel.value;
  sel.innerHTML = '<option value="">'+t('all_pos')+'</option>' + teams.map(tn => `<option value="${tn}" ${tn===current?'selected':''}>${tn}</option>`).join('');
  // Also populate season filter in stats
  const ss = document.getElementById('filter-season-stats');
  if(ss) {
    const cs = ss.value;
    const eds = (typeof _editionsList === 'function' ? _editionsList() : []).filter(e => /2K\d{2}/.test(e));
    const def = !window._statsSeasonTouched && !cs && typeof _currentEdition === 'function' && _currentEdition() && eds.includes(_currentEdition()) ? 'ed:' + _currentEdition() : cs;
    ss.innerHTML = ('<option value="">'+t('all_seasons')+'</option>')
      + eds.map(e => `<option value="ed:${e}"${'ed:' + e === def ? ' selected' : ''}>🎮 ${e} — ${currentLang === 'en' ? 'whole edition' : 'cała edycja'}</option>`).join('')
      + seasons.map(s=>`<option value="${s.id}"${s.id===def?' selected':''}>${s.name}</option>`).join('');
    // filtr ustawia się po wczytaniu danych — jeśli statystyki są już na ekranie, przerysuj je z nowym filtrem
    if(ss.value !== cs && document.getElementById('view-stats')?.classList.contains('active')) setTimeout(() => renderStats(), 0);
  }
}

// Column sort state
let statsSortCol = 'pts';
let statsSortDir = -1; function sortByCol(){return __lz(2,'sortByCol',this,arguments)}

function renderStats(){return __lz(2,'renderStats',this,arguments)} function _renderStatsInner(){return __lz(2,'_renderStatsInner',this,arguments)}

function pmShowPos(){return __lz(2,'pmShowPos',this,arguments)}

function openPlayerModal(){return __lz(2,'openPlayerModal',this,arguments)}


function renderFormChart(){return __lz(2,'renderFormChart',this,arguments)}




// ═══════════════════════════════════════════════════════════════
// IMPORT MATCHES FROM JSON
// ═══════════════════════════════════════════════════════════════
let _importBuffer = null;

function triggerImport(){return __lz(2,'triggerImport',this,arguments)}

function showImportPreview(){return __lz(2,'showImportPreview',this,arguments)}

function confirmImport(){return __lz(2,'confirmImport',this,arguments)}



function initWalkoverTeams() {
  const dl = document.getElementById('wo-teams-list');
  if(!dl) return;
  const all = [...new Set([...Object.keys(window.teams||{}), ...matches.flatMap(m=>[m.team1.name,m.team2.name])])].sort();
  dl.innerHTML = all.map(tn=>`<option value="${tn}">`).join('');
  // Set today as default date
  const wd = document.getElementById('wo-date');
  if(wd && !wd.value) wd.value = new Date().toISOString().split('T')[0];
}

function saveWalkover(){return __lz(2,'saveWalkover',this,arguments)}


function addRound(){return __lz(2,'addRound',this,arguments)}

function deleteRound(){return __lz(2,'deleteRound',this,arguments)}

function renderRoundsList(){return __lz(2,'renderRoundsList',this,arguments)}

function saveTeamAliases(){return __lz(2,'saveTeamAliases',this,arguments)}
function addTeamAlias(){return __lz(2,'addTeamAlias',this,arguments)}
function removeTeamAlias(){return __lz(2,'removeTeamAlias',this,arguments)}
function renderTeamAliases(){return __lz(2,'renderTeamAliases',this,arguments)}
function applyTeamAliasesToAllMatches(){return __lz(2,'applyTeamAliasesToAllMatches',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// TEAMS MANAGEMENT
// ═══════════════════════════════════════════════════════════════
// teams = { "Polish Boars": { logo: "data:image/..." }, ... }
let teams = {};

function loadTeams() {
  // teams are loaded from JSONBin in loadData() - just sync window.teams
  window.teams = teams;
}
function saveTeams(){return __lz(2,'saveTeams',this,arguments)}

function renderTeamsSection(){return __lz(2,'renderTeamsSection',this,arguments)}

function renderTeamsList(){return __lz(2,'renderTeamsList',this,arguments)}

function addTeamEntry(){return __lz(2,'addTeamEntry',this,arguments)}

function uploadTeamLogo(){return __lz(2,'uploadTeamLogo',this,arguments)}

function removeTeamLogo(){return __lz(2,'removeTeamLogo',this,arguments)}

async function deleteTeam(teamName) {
  // Check if team has any matches
  const hasMatches = matches.some(m => m.team1.name === teamName || m.team2.name === teamName);
  if(hasMatches) {
    showToast('❌ Nie można usunąć drużyny — ma zapisane mecze (' +
      matches.filter(m => m.team1.name === teamName || m.team2.name === teamName).length + ')', 'error');
    return;
  }
  // Check schedule
  const inSchedule = (schedule||[]).some(s => s.team1 === teamName || s.team2 === teamName);
  if(inSchedule) {
    showToast('❌ Nie można usunąć — drużyna jest w harmonogramie', 'error');
    return;
  }
  if(!confirm('Usunąć drużynę "' + teamName + '"?')) return;
  if(teams[teamName]) delete teams[teamName];
  window.teams = teams;
  await saveData();
  renderTeamsList();
  showToast('🗑 Usunięto: ' + teamName, 'info');
}

function teamLogoInitials(){return __lz(2,'teamLogoInitials',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// SCHEDULE / HARMONOGRAM
// ═══════════════════════════════════════════════════════════════
function renderSchedule() {
  const isAdmin = _isLoggedInSync();
  const now = new Date();

  // Admin button
  const adminBtn = document.getElementById('schedule-admin-btn');
  if(adminBtn) adminBtn.innerHTML = isAdmin
    ? `<button class="btn btn-primary" onclick="openScheduleAdd()">📅 Planowany mecz</button> <button class="btn btn-ghost" onclick="showView('add-match')" style="margin-left:.5rem">🏀 Dodaj wynik meczu</button>`
    : '';

  renderSeasonSchedule();
  const upcoming = schedule.filter(s => !s.played && !s.generated).sort((a,b)=>new Date(a.date+'T'+(a.time||'00:00'))-new Date(b.date+'T'+(b.time||'00:00')));
  const played   = schedule.filter(s =>  s.played && !s.generated).sort((a,b)=>new Date(b.date+'T'+(b.time||'00:00'))-new Date(a.date+'T'+(a.time||'00:00')));

  const renderCard = (s, showPlayed) => {
    const matchResult = s.matchId ? matches.find(m => Number(m.id) === Number(s.matchId)) : null;
    const t1color = teamColor(s.team1); const t2color = teamColor(s.team2);
    const dateStr = s.date ? new Date(s.date).toLocaleDateString('pl-PL',{weekday:'short',day:'numeric',month:'short'}) : '?';
    const timeStr = s.time || '';
    const isPast  = s.date && new Date(s.date) < now && !s.played;

    let resultBadge = '';
    if(matchResult) {
      const w1 = matchResult.team1.score > matchResult.team2.score;
      const winner = w1 ? matchResult.team1.name : matchResult.team2.name;
      resultBadge = `<div style="margin-top:.75rem;padding:.5rem 1rem;background:rgba(245,197,24,.08);border:1px solid rgba(245,197,24,.2);border-radius:8px;text-align:center">
        <span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;color:var(--accent)">${matchResult.team1.score} — ${matchResult.team2.score}</span>
        <span style="font-size:.75rem;color:var(--muted);display:block">Wygrali: ${winner}</span>
      </div>`;
    } else if(s.prediction) {
      resultBadge = `<div style="margin-top:.75rem;padding:.5rem 1rem;background:rgba(52,152,219,.08);border:1px solid rgba(52,152,219,.2);border-radius:8px">
        <div style="font-size:.7rem;color:var(--muted);margin-bottom:.2rem">🤖 Predykcja AI</div>
        <div style="font-size:.85rem;line-height:1.5;color:var(--text)">${s.prediction}</div>
      </div>`;
    }

    const adminActions = isAdmin ? `
      <div style="display:flex;gap:.5rem;margin-top:.75rem;flex-wrap:wrap">
        ${!s.played ? `<button class="btn btn-ghost" style="font-size:.75rem;padding:.3rem .7rem" onclick="linkScheduleMatch(${s.id})">🔗 Połącz z meczem</button>` : ''}
        ${!s.played && hasAI() && _isLoggedInSync() ? `<button class="btn btn-ghost" style="font-size:.75rem;padding:.3rem .7rem" onclick="predictScheduleMatch(${s.id})">🤖 Predykcja AI</button>` : ''}
        <button class="btn btn-ghost" style="font-size:.75rem;padding:.3rem .7rem" onclick="openScheduleEdit(${s.id})">✏️ Edytuj</button>
        <button class="btn btn-danger" style="font-size:.75rem;padding:.3rem .7rem" onclick="deleteScheduleMatch(${s.id})">🗑</button>
      </div>` : '';

    return `<div style="background:var(--surface);border:1px solid ${isPast?'var(--loss)':'var(--border)'};border-radius:12px;padding:1rem 1.25rem;margin-bottom:.75rem${s.played?';opacity:.7':''}">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem">
        <div style="font-size:.8rem;color:${isPast?'var(--loss)':'var(--muted)'}">
          📅 ${dateStr}${timeStr ? ' · ⏰ '+timeStr : ''}
          ${s.seasonId ? ' · <span style="color:var(--accent);font-weight:600">'+(seasons.find(x=>x.id===s.seasonId)||{}).name+'</span>' : ''}
          ${isPast ? ' · <span style="color:var(--loss)">Nie rozegrany</span>' : ''}
        </div>
        ${s.streamUrl ? `<a href="${s.streamUrl}" target="_blank" style="font-size:.8rem;color:var(--accent);text-decoration:none">▶ Stream</a>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:1rem;justify-content:center">
        <div style="display:flex;align-items:center;gap:.5rem;flex:1;justify-content:flex-end">
          <div style="text-align:right"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.1rem">${s.team1}</div>${_voteBtn(s,'team1')}</div>
          ${teamLogo(s.team1,40,'1rem')}
        </div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1rem;color:var(--muted);width:40px;text-align:center">VS</div>
        <div style="display:flex;align-items:center;gap:.5rem;flex:1">
          ${teamLogo(s.team2,40,'1rem')}
          <div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.1rem">${s.team2}</div>${_voteBtn(s,'team2')}</div>
        </div>
      </div>
      ${_voteBar(s, matchResult)}
      ${resultBadge}
      ${adminActions}
    </div>`;
  };

  const upEl = document.getElementById('schedule-upcoming');
  const plEl = document.getElementById('schedule-played');

  if(upEl) upEl.innerHTML = upcoming.length
    ? `<div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1.1rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.75rem">Nadchodzące mecze (${upcoming.length})</div>` + upcoming.map(s=>renderCard(s,false)).join('')
    : (schedule.some(x => x.generated) ? '' : `<div class="card" style="padding:1.5rem;text-align:center;color:var(--muted)">${t('no_schedule')}</div>`);

  if(plEl) plEl.innerHTML = played.length
    ? `<div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1.1rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.75rem">Rozegrane (${played.length})</div>` + played.map(s=>renderCard(s,true)).join('')
    : '';
}

function openScheduleAdd(){return __lz(2,'openScheduleAdd',this,arguments)}

function openScheduleEdit(){return __lz(2,'openScheduleEdit',this,arguments)}

function saveScheduleMatch(){return __lz(2,'saveScheduleMatch',this,arguments)}

function deleteScheduleMatch(){return __lz(2,'deleteScheduleMatch',this,arguments)}

function linkScheduleMatch(){return __lz(2,'linkScheduleMatch',this,arguments)}

function confirmLinkMatch(){return __lz(2,'confirmLinkMatch',this,arguments)}

function predictScheduleMatch(){return __lz(2,'predictScheduleMatch',this,arguments)}

function renderScheduleDashboard() {
  const el = document.getElementById('schedule-dashboard');
  if(!el) return;
  const upcoming = schedule.filter(s=>!s.played && s.date).sort((a,b)=>new Date(a.date+'T'+(a.time||'00:00'))-new Date(b.date+'T'+(b.time||'00:00'))).slice(0,3);
  if(!upcoming.length) { el.style.display='none'; return; }
  el.style.display='block';
  el.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
    <div class="section-title" style="font-size:1.3rem;margin-bottom:0">📅 Nadchodzące mecze</div>
    <button onclick="showView('schedule')" style="font-size:.75rem;background:var(--surface2);border:1px solid var(--border);color:var(--muted);padding:.3rem .7rem;border-radius:6px;cursor:pointer;font-family:inherit">Wszystkie →</button>
  </div>` + upcoming.map(s=>{
    const dateStr = s.date ? new Date(s.date).toLocaleDateString('pl-PL',{weekday:'short',day:'numeric',month:'short'}) : '?';
    const live = typeof _isLive === 'function' && _isLive(s);
    const today = s.date === new Date().toLocaleDateString('sv-SE');
    // linki do transmisji: podane przez kapitanów (terminarz) albo stary link przy meczu
    let streams = s.generated && typeof _streamLinks === 'function' ? _streamLinks(s, true) : '';
    if(!streams && s.streamUrl) streams = `<a href="${_h(s.streamUrl)}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none;font-weight:700;font-size:.7rem">📺 Transmisja</a>`;
    if(streams && s.generated && !s.played && typeof _effStream === 'function' && (_effStream(s, 'team1') || _effStream(s, 'team2'))) streams += ` <button onclick="event.stopPropagation();openMultistream('${s.id}')" class="btn ${live || today ? 'btn-primary' : 'btn-ghost'}" title="${_g('Obie transmisje obok siebie', 'Both streams side by side')}" style="font-size:.64rem;padding:.1rem .4rem">🖥️ Multistream</button>`;
    const myTeam = discordUser ? teamRegistrations.find(r => r.status === 'approved' && r.captain?.id === discordUser.id)?.teamName : null;
    const canAdd = s.generated && !streams && (_isLoggedInSync() || (myTeam && [s.team1, s.team2].includes(myTeam)));
    const extra = live || streams || canAdd ? `<div style="display:flex;gap:.5rem;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:.4rem;padding-top:.4rem;border-top:1px dashed rgba(127,127,127,.2)">
        ${live ? '<span style="background:#dc2626;color:#fff;font-size:.6rem;font-weight:900;letter-spacing:1px;border-radius:4px;padding:.05rem .4rem">🔴 NA ŻYWO</span>' : ''}
        ${streams}
        ${canAdd ? `<button onclick="showView('schedule');_ssWeek=${s.week || 1};renderSchedule();setTimeout(()=>openStreamModal('${s.id}'),150)" style="font-size:.66rem;background:none;border:1px solid var(--border);color:var(--muted);border-radius:5px;padding:.1rem .45rem;cursor:pointer;font-family:inherit">📺 Dodaj transmisję</button>` : ''}
      </div>` : '';
    return `<div style="padding:.6rem .9rem;background:var(--surface);border:1px solid ${live ? 'rgba(220,38,38,.6)' : 'var(--border)'};border-radius:8px;margin-bottom:.4rem">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:.4rem">${teamLogo(s.team1,24,'.65rem')}<span style="font-weight:700;font-size:.9rem">${s.team1}</span></div>
        <div style="text-align:center"><div style="font-size:.65rem;color:${today ? 'var(--accent)' : 'var(--muted)'};font-weight:${today ? 800 : 400}">${today ? 'DZIŚ' : dateStr}${s.time?' '+s.time:''}</div><div style="font-size:.75rem;font-weight:700;color:var(--muted)">VS</div></div>
        <div style="display:flex;align-items:center;gap:.4rem"><span style="font-weight:700;font-size:.9rem">${s.team2}</span>${teamLogo(s.team2,24,'.65rem')}</div>
      </div>${extra}
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
// ═══ Dashboard pokazuje tylko bieżący sezon ═══════════════════════
// Pełna historia zostaje w Meczach / Statystykach (filtr sezonu).
let _seasonScopeDepth = 0;
let _allMatchesRef = null;
function _withAllMatches(fn) {
  if(_seasonScopeDepth === 0 || !_allMatchesRef) return fn();
  const scoped = matches;
  matches = _allMatchesRef;
  try { return fn(); } finally { matches = scoped; }
}
function _withSeasonMatches(fn) {
  if(_seasonScopeDepth > 0 || !currentSeasonId || !seasons.some(x => x.id === currentSeasonId)) return fn();
  const all = matches;
  _allMatchesRef = all;
  matches = all.filter(m => m.seasonId === currentSeasonId);
  _seasonScopeDepth++;
  try { return fn(); }
  finally { _seasonScopeDepth--; matches = all; }
}

function renderMvpRace() { const el = document.getElementById('mvp-race-wrap'); if(el) { try { el.innerHTML = _mvpHtml(5); } catch(e) { el.innerHTML = ''; } } }
function renderDashboard() {
  try { renderMvpRace(); } catch(e) {}
  renderEventsDashboard();
  renderStandings();
  if(typeof renderPlayoffDashboard === 'function') renderPlayoffDashboard();
  _eloCache = null; _achCache = null;
  for(const fn of [updateMyPanelBadge, renderLiveBanner, renderQuickLinks, renderRecordsBanner, renderAchievementsDashboard, renderAwardsDashboard, renderBracketDashboard, renderPenaltiesNote, renderScenarios, renderClassics, renderPowerRanking, renderEloDashboard]) {
    try { fn(); } catch(e) { console.warn('dashboard extras', fn.name, e); }
  }
  loadTeams();
  setTimeout(renderScheduleDashboard, 100);
  renderLeaders();
  renderTeamOfWeek();
  updateSeasonBadge();
  renderMilestoneBanner();
  renderRoundComparison();
  renderEventRatings();
  renderTeamRegistrations();
}

function getHotPlayers() {
  const pg={};
  [...matches].sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(m=>{
    [m.team1,m.team2].forEach(t=>(t.players||[]).forEach(p=>{
      if(!pg[p.name])pg[p.name]=[];
      pg[p.name].push(gradeToNum(p.grade));
    }));
  });
  const hot=new Set();
  Object.entries(pg).forEach(([n,g])=>{if(g.length>=3&&g.slice(-3).every(x=>x>=11))hot.add(n);});
  return hot;
}
function renderTeamForm(sorted) {
  const wrap = document.getElementById('team-form-wrap');
  if(!wrap) return;
  if(!sorted.length) { wrap.innerHTML='<div style="color:var(--muted);font-size:.9rem">Brak danych</div>'; return; }
  const byDate = [...matches].sort((a,b)=>new Date(b.date)-new Date(a.date));
  wrap.innerHTML = sorted.map(([name,s]) => {
    const teamMatches = byDate.filter(m=>m.team1.name===name||m.team2.name===name);
    const last5 = teamMatches.slice(0,7);
    const dots = Array.from({length:7},(_,i)=>{
      if(i>=last5.length) return '<span class="fd-e" title="brak meczu"></span>';
      const m=last5[i], my=m.team1.name===name?m.team1.score:m.team2.score, op=m.team1.name===name?m.team2.score:m.team1.score;
      const opp=m.team1.name===name?m.team2.name:m.team1.name;
      return my>op?`<span class="fd-w" title="W vs ${opp} ${my}-${op}"></span>`:`<span class="fd-l" title="L vs ${opp} ${my}-${op}"></span>`;
    }).join('');
    const streak = last5.length>0 ? (() => {
      let sc=0; for(const m of teamMatches){ const my=m.team1.name===name?m.team1.score:m.team2.score,op=m.team1.name===name?m.team2.score:m.team1.score; if(my>op)sc++;else break; }
      let sl=0; for(const m of teamMatches){ const my=m.team1.name===name?m.team1.score:m.team2.score,op=m.team1.name===name?m.team2.score:m.team1.score; if(my<op)sl++;else break; }
      if(sc>=2) return `<span style="color:var(--win);font-size:.75rem;font-weight:700">${sc}W z rzędu</span>`;
      if(sl>=2) return `<span style="color:var(--loss);font-size:.75rem;font-weight:700">${sl}L z rzędu</span>`;
      return '';
    })() : '';
    return `<div class="form-row"><div class="form-name"><span style="cursor:pointer;text-decoration:underline dotted;text-underline-offset:3px" onclick="openTeamModal('${name}')" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color=''">${name}</span> ${streak}</div><div class="form-dots">${dots}</div></div>`;
  }).join('');
}

function renderTop3() {
  const wrap = document.getElementById('top3-wrap');
  if(!wrap) return;
  const agg = getAggregatedStats();
  if(!agg.length) { wrap.innerHTML='<div style="color:var(--muted);font-size:.9rem">Brak danych</div>'; return; }
  const ranked = agg.filter(p=>p.gp>=1).map(p=>({...p, avgGN: p.gradeSum/p.gp, _score: calcCompositeScore(p)})).sort((a,b)=>b._score-a._score).slice(0,3);
  if(!ranked.length) { wrap.innerHTML='<div style="color:var(--muted);font-size:.9rem">Minimum 2 mecze wymagane</div>'; return; }
  const medals=['🥇','🥈','🥉'];
  wrap.innerHTML = ranked.map((p,i)=>{
    const gr = numToGrade(p.avgGN);
    const pts = p.gp>0?(p.pts/p.gp).toFixed(1):'0.0';
    return `<div class="top3-row">
      <div class="top3-rank top3-rank-${i+1}">${medals[i]}</div>
      <div class="top3-info"><div class="top3-name" style="cursor:pointer" onclick="openPlayerModal('${p.name}','${p.team}')" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color=''">${p.name}</div><div class="top3-team" style="cursor:pointer;display:flex;align-items:center;gap:.3rem" onclick="openTeamModal('${p.team}')" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color=''">${teamLogo(p.team,18,'.5rem')}<span>${p.team} &middot; ${pts} PPG &middot; ${p.gp} GP</span></div></div>
      <div class="top3-grade"><span class="grade grade-${gr.replace('+','p').replace('-','m')}">${gr}</span></div>
    </div>`;
  }).join('');
}
function renderStandings() {
  // Exclude playoff matches from standings
  const po = playoffs.length ? playoffs[playoffs.length-1] : null;
  const _poSt = playoffs.length ? playoffs[playoffs.length-1] : null;
  const _poStPairs = new Set(
    (_poSt ? _poSt.rounds : []).flatMap(r => r.pairs.map(p => [p.team1, p.team2].sort().join('|')))
  );
  const _poStCutoff = _poSt ? (_poSt.startDate || (_poSt.createdAt || '').slice(0,10) || '0000-00-00') : null;
  const isPlayoffMatch = m => _isAnyPlayoffMatch(m);
  const regularMatches = matches.filter(m => !isPlayoffMatch(m));

  const ts={};
  regularMatches.forEach(m=>{
    [m.team1,m.team2].forEach(t=>{if(!ts[t.name])ts[t.name]={w:0,l:0,wo:0,pf:0,pa:0};});
    const isWalkover = m.walkover === true;
    const w1=m.team1.score>m.team2.score;
    if(isWalkover) {
      // walkover: winner gets 2 pkt, loser gets 0 pkt
      ts[m.team1.name].w+=w1?1:0; ts[m.team1.name].l+=w1?0:1;
      ts[m.team2.name].w+=w1?0:1; ts[m.team2.name].l+=w1?1:0;
      if(!w1) ts[m.team1.name].wo+=1; else ts[m.team2.name].wo+=1;
    } else {
      ts[m.team1.name].w+=w1?1:0; ts[m.team1.name].l+=w1?0:1;
      ts[m.team1.name].pf+=m.team1.score; ts[m.team1.name].pa+=m.team2.score;
      ts[m.team2.name].w+=w1?0:1; ts[m.team2.name].l+=w1?1:0;
      ts[m.team2.name].pf+=m.team2.score; ts[m.team2.name].pa+=m.team1.score;
    }
  });
  // Drużyny z terminarza bieżącego sezonu — widoczne w tabeli od pierwszego dnia (0-0)
  const _fx = seasons.find(x => x.id === currentSeasonId)?.fixture;
  const _fxTeams = _fx
    ? (_fx.groups?.length ? _fx.groups.flatMap(g => g.teams)
       : [...new Set(schedule.filter(x => x.generated && x.seasonId === currentSeasonId).flatMap(x => [x.team1, x.team2]))])
    : [];
  _fxTeams.forEach(n => { if(!ts[n]) ts[n] = { w:0, l:0, wo:0, pf:0, pa:0 }; });
  (typeof _penaltiesFor === 'function' ? _penaltiesFor(currentSeasonId || null) : []).forEach(p => { if(ts[p.team]) ts[p.team].pen = (ts[p.team].pen || 0) + p.points; });
  const _standingsGroups = _fx?.format === 'groups' && _fx.groups?.length ? _fx.groups : null;
  // Liga points: win=2, loss (normal)=1, walkover loss=0
  const ligaPts = (s) => s.w*2 + (s.l - s.wo)*1 + s.wo*0 - (s.pen || 0);
  const sorted=Object.entries(ts).sort((a,b)=>{
    const pa=ligaPts(a[1]), pb=ligaPts(b[1]);
    return pb!==pa ? pb-pa : b[1].w/(b[1].w+b[1].l||1)-a[1].w/(a[1].w+a[1].l||1);
  });
  const tbody=document.getElementById('standings-body');
  if(!sorted.length){tbody.innerHTML='<tr><td colspan="10" style="text-align:center;padding:2rem;color:var(--muted)">Brak danych</td></tr>';renderTeamForm([]);renderTop3();return;}
  const byD=[...regularMatches].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const tl5={},streaks={};
  Object.keys(ts).forEach(n=>{
    const tm=byD.filter(m=>m.team1.name===n||m.team2.name===n);
    tl5[n]=tm.slice(0,5).map(m=>(m.team1.name===n?m.team1.score:m.team2.score)>(m.team1.name===n?m.team2.score:m.team1.score)?'w':'l');
    let sw=0,sl=0;
    for(const m of tm){const my=m.team1.name===n?m.team1.score:m.team2.score,op=m.team1.name===n?m.team2.score:m.team1.score;if(my>op){if(sl>0)break;sw++;}else{if(sw>0)break;sl++;}}
    if(sw>0) streaks[n]='<span class="streak-w">W'+sw+'</span>';
    else if(sl>0) streaks[n]='<span class="streak-l">L'+sl+'</span>';
    else streaks[n]='<span style="color:var(--muted)">-</span>';
  });
  const hot=getHotPlayers();
  const _row=([name,s],i)=>{
    const gp=s.w+s.l,pct=gp>0?(s.w/gp).toFixed(3):'.000';
    const ligaPts=s.w*2+(s.l-s.wo)*1+s.wo*0-(s.pen||0);
    const ppg=gp>0?(s.pf/gp).toFixed(1):'0.0',opp=gp>0?(s.pa/gp).toFixed(1):'0.0';
    const l5=tl5[name]||[];
    const l5h='<div class="l5">'+Array.from({length:5},(_,j)=>j>=l5.length?'<span class="l5e"></span>':l5[j]==='w'?'<span class="l5w"></span>':'<span class="l5l"></span>').join('')+'</div>';
    const hc=[...hot].filter(p=>matches.some(m=>[...(m.team1.players||[]),...(m.team2.players||[])].some(pl=>pl.name===p&&(m.team1.name===name||m.team2.name===name)))).length;
    const _hs=hc>1?' '+t('hot_streak_has'):'';const _hx=hc>1?' x'+hc:'';const _htitle=String.fromCharCode(128293)+' Hot Streak: '+hc+' '+t('hot_streak_players')+_hs+' '+t('hot_streak_last3');const hb=hc>0?'<span class="hot" title="'+_htitle+'">' +String.fromCharCode(128293)+_hx+'</span>':'';
    return `<tr><td style="padding-left:1.5rem"><span class="rank-num rank-${i+1}">${i+1}</span></td><td style="font-weight:700"><span class="tlink" data-t="${name.replace(/"/g,'&quot;')}" style="cursor:pointer;text-decoration:underline dotted;text-underline-offset:3px">${name}</span>${hb}</td><td>${gp}</td><td>${s.w}</td><td>${s.l}</td><td style="font-weight:900;color:var(--accent)">${ligaPts}</td><td>${pct}</td><td>${ppg}</td><td>${opp}</td><td>${streaks[name]||'-'}</td><td>${l5h}</td></tr>`;
  };
  if(_standingsGroups) {
    const inGroup = new Set(_standingsGroups.flatMap(g => g.teams));
    const parts = _standingsGroups.map(g => ({ name: g.name, list: sorted.filter(([n]) => g.teams.includes(n)) }));
    const rest = sorted.filter(([n]) => !inGroup.has(n));
    if(rest.length) parts.push({ name: 'Poza grupami', list: rest });
    tbody.innerHTML = parts.map(pt => `<tr><td colspan="11" style="padding:.55rem 1.5rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;letter-spacing:1px;color:var(--accent);background:var(--surface2)">${pt.name}${_zoneLegend(pt.name)}</td></tr>` + pt.list.map((x, i, arr) => _zoneMark(_row(x, i, arr), _zoneOf(pt.name, i, pt.list.length))).join('')).join('');
  } else {
    tbody.innerHTML = sorted.map(_row).join('');
  }
  try { const t2 = document.getElementById('standings-body-2'); if(t2) t2.innerHTML = tbody.innerHTML; } catch(e) {}
  renderTeamForm(sorted);
  renderTop3();
  if(typeof renderPlayoffDashboard === 'function') renderPlayoffDashboard();
  if(typeof syncPlayoffBracket === 'function') syncPlayoffBracket();
}

function renderLeaders() {
  const all = getAggregatedStats();
  const grid = document.getElementById('leaders-grid');
  if(!all.length) {
    grid.innerHTML = '<div class="empty" style="grid-column:1/-1;padding:2rem"><div class="icon">🏀</div><p>'+t('add_matches_for_leaders')+'</p></div>';
    return;
  }
  const leaders = [
    { stat: 'pts', label: t('stat_pts'), icon: '🏀' },
    { stat: 'reb', label: t('stat_reb'), icon: '💪' },
    { stat: 'ast', label: t('stat_ast'), icon: '🎯' },
    { stat: 'stl', label: t('stat_stl'), icon: '🐍' },
    { stat: 'blk', label: t('stat_blk'), icon: '🛡️' },
  ];
  grid.innerHTML = leaders.map(l => {
    const sorted = [...all].filter(p=>p.gp>=1).sort((a,b) => (b[l.stat]/b.gp) - (a[l.stat]/a.gp));
    const top = sorted[0];
    const val = top ? (top[l.stat]/top.gp).toFixed(1) : '0.0';
    return `<div class="leader-card">
      <div class="leader-stat-name">${l.icon} ${l.label}</div>
      <div class="leader-value">${val}</div>
      <div class="leader-player" style="cursor:pointer;text-decoration:underline dotted;text-underline-offset:3px" onclick="openPlayerModal('${top ? top.name : ''}','${top ? top.team : ''}')"><span onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color=''">${top ? top.name : '-'}</span></div>
      <div class="leader-team" style="cursor:pointer" onclick="openTeamModal('${top ? top.team : ''}')"><span onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color=''">${top ? top.team : ''}</span></div>
    </div>`;
  }).join('');
}

function setStatus(){return __lz(3,'setStatus',this,arguments)}

function formatDate(d) {
  if(!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('pl-PL', { day:'numeric', month:'long', year:'numeric' });
}


function sha256(){return __lz(3,'sha256',this,arguments)}

// Synchronous check — reads flag set after successful login
function _isLoggedInSync() {
  return localStorage.getItem('nba2k_auth') === 'ok';
}

async function isLoggedIn() {
  return _isLoggedInSync();
}

// Events admin — separate role, can manage events without full admin access
function _isEventsAdminSync() {
  return _isLoggedInSync() || localStorage.getItem('nba2k_events_auth') === 'ok';
}

function checkEventsLogin(){return __lz(3,'checkEventsLogin',this,arguments)}

function logoutEvents() {
  localStorage.removeItem('nba2k_events_auth');
  localStorage.removeItem('nba2k_events_token_hash');
  updateEventsAuthUI();
  renderEvents();
  showToast('Wylogowano z managera eventów', 'info');
}

function updateEventsAuthUI() {
  const btn = document.getElementById('events-login-btn');
  if (!btn) return;
  const isEvAdmin = _isEventsAdminSync();
  const isFullAdmin = _isLoggedInSync();
  if (isFullAdmin) {
    btn.style.display = 'none'; // full admin already has access
  } else if (isEvAdmin) {
    btn.textContent = '🏆 Wyloguj eventy';
    btn.onclick = logoutEvents;
    btn.style.display = 'inline-flex';
  } else {
    btn.textContent = '🏆 Eventy admin';
    btn.onclick = () => document.getElementById('events-auth-modal').classList.add('open');
    if(location.hash === '#eventy-admin') localStorage.setItem('nba2k_show_events_login', '1');
    btn.style.display = localStorage.getItem('nba2k_show_events_login') === '1' ? 'inline-flex' : 'none';
  }
}

function checkLogin(){return __lz(3,'checkLogin',this,arguments)}

function logout(){return __lz(3,'logout',this,arguments)}

function updateAuthUI() {
  // Update Discord user bar
  const bar = document.getElementById('discord-user-bar');
  if(bar) {
    if(discordUser) {
      bar.innerHTML = `
        <img src="${discordUser.avatar||''}" onerror="this.style.display='none'"
          style="width:26px;height:26px;border-radius:50%;border:2px solid var(--accent)">
        <span onclick="openMyPanel()" title="Mój panel" style="font-size:.8rem;font-weight:700;color:var(--text);cursor:pointer;text-decoration:underline dotted">${_h(discordUser.name)}</span>
        ${discordUser.session ? '' : `<button onclick="loginWithDiscord()" title="Odśwież logowanie — potrzebne do zgłoszeń, głosowania i wyboru terminów"
          style="background:rgba(245,197,24,.12);border:1px solid var(--accent);color:var(--accent);border-radius:4px;padding:.1rem .45rem;font-size:.7rem;font-weight:700;cursor:pointer;font-family:inherit">🔑 Odśwież</button>`}
        <button onclick="logoutDiscord()" title="Wyloguj z Discorda"
          style="background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:4px;padding:.1rem .4rem;font-size:.75rem;cursor:pointer;font-family:inherit">✕</button>`;
    } else {
      bar.innerHTML = `
        <button onclick="loginWithDiscord()" title="Zaloguj się przez Discord"
          style="display:inline-flex;align-items:center;gap:6px;background:#5865F2;border:1px solid #5865F2;color:#fff;border-radius:8px;padding:5px 11px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap"
          onmouseover="this.style.background='#4752c4'" onmouseout="this.style.background='#5865F2'">
          <svg width="16" height="12" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;filter:brightness(0) invert(1)"><path d="M60.1 4.9A58.5 58.5 0 0 0 45.4.4a.2.2 0 0 0-.2.1 40.7 40.7 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.6 37.6 0 0 0 25.4.5a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.5 4.9a.2.2 0 0 0-.1.1C1.5 18.1-.9 31 .3 43.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 9 .2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.1 47.1 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.7-9 .2.2 0 0 0 .1-.2C73 29.2 69.4 16.4 60.2 5a.2.2 0 0 0-.1-.1zM23.7 36c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" fill="#8891f0"/></svg>
          Zaloguj
        </button>`;
    }
  }
  isLoggedIn().then(logged => {
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) logoutBtn.style.display = logged ? 'inline-flex' : 'none';

    const bazaBtn = document.getElementById('baza-btn');
    if(bazaBtn) bazaBtn.style.display = logged ? 'inline-flex' : 'none';
    const seasonBtn = document.getElementById('season-btn');
    if(seasonBtn) seasonBtn.style.display = logged ? 'inline-flex' : 'none';
    const playoffBtn = document.getElementById('playoff-btn');
    if(playoffBtn) playoffBtn.style.display = logged ? 'inline-flex' : 'none';
    const psnMapBtn = document.getElementById('psn-map-btn');
    if(psnMapBtn) psnMapBtn.style.display = logged ? 'inline-flex' : 'none';
    const teamRegBtn = document.getElementById('team-reg-admin-btn');
    if(teamRegBtn) teamRegBtn.style.display = logged ? 'inline-flex' : 'none';
    document.querySelectorAll('header nav button').forEach(b => {
      if(/showView\('(add-match|aliases)'\)/.test(b.getAttribute('onclick') || '')) b.style.display = logged ? '' : 'none';
    });
    // Re-render matches to show/hide delete buttons
    if(document.getElementById('view-matches')?.classList.contains('active')) renderMatches();
    // Update events admin button
    updateEventsAuthUI();
    renderTeamRegistrations();
  });
}

let pendingAuthView = null;
const PROTECTED_VIEWS = ['add-match', 'aliases'];
try { document.querySelectorAll('header nav button').forEach(b => { if(/showView\('(add-match|aliases)'\)/.test(b.getAttribute('onclick') || '') && localStorage.getItem('nba2k_auth') !== 'ok') b.style.display = 'none'; }); } catch(e) {}

// Set today's date
document.getElementById('match-date').value = new Date().toISOString().split('T')[0];

function openSetupModal(){return __lz(3,'openSetupModal',this,arguments)}

function saveSetup(){return __lz(3,'saveSetup',this,arguments)}

// Initial render
(async () => {
  // Check if returning from Discord OAuth
  const _urlParams = new URLSearchParams(window.location.search);
  const _discordParam = _urlParams.get('discord_user');
  const _oauthError   = _urlParams.get('oauth_error');

  // If link contains ?w= (worker URL passed from admin to GM/Board links), save it
  const _wParam = _urlParams.get('w');
  if(_wParam) {
    workerUrl = _wParam;
    localStorage.setItem('nba2k_worker_url', _wParam);
  }

  // If link contains ?ev_tok= (events token embedded in GM panel link), store it
  const _evTok = _urlParams.get('ev_tok');
  if(_evTok) {
    localStorage.setItem('nba2k_events_token_hash', _evTok);
    localStorage.setItem('nba2k_events_auth', 'ok');
    window.history.replaceState({}, '', window.location.pathname + (window.location.hash || ''));
  }

  if(_oauthError) {
    window.history.replaceState({}, '', window.location.pathname);
    // Show friendly modal with instructions
    setTimeout(() => {
      const msg = decodeURIComponent(_oauthError);
      const isRateLimited = /rate.?limit|too many token/i.test(msg);
      const isInAppBrowser = !isRateLimited && /invalid_grant|access.?token|in.app.browser/i.test(msg);
      let body;
      if(isRateLimited) {
        body = `<div style="font-size:.9rem;line-height:1.7;margin-bottom:1rem">
          Discord zablokował logowanie z Twojego konta z powodu <b>zbyt wielu prób w krótkim czasie</b>.<br><br>
          <b>Co zrobić?</b><br>
          1. Poczekaj <b>kilka godzin</b> (lub do następnego dnia) i spróbuj ponownie.<br>
          2. Jeśli problem się powtarza — poproś <b>admina o dodanie Cię ręcznie</b> do eventu.
        </div>
        <div style="display:flex;gap:.5rem">
          <button onclick="document.getElementById('oauth-error-modal').classList.remove('open')" class="btn btn-primary" style="flex:1;justify-content:center">OK, rozumiem</button>
        </div>`;
      } else if(isInAppBrowser) {
        body = `<div style="font-size:.9rem;line-height:1.7;margin-bottom:1rem">
          Logujesz się z <b>telefonu przez Discord</b> — link otworzył się w wbudowanej przeglądarce która blokuje logowanie.<br><br>
          <b>Rozwiązanie:</b> Skopiuj link poniżej i otwórz go w <b>Chrome</b> lub <b>Safari</b>.
        </div>
        <div style="background:var(--surface2);border-radius:6px;padding:.5rem .75rem;font-size:.75rem;color:var(--muted);word-break:break-all;margin-bottom:.75rem">${window.location.origin + window.location.pathname}</div>
        <div style="display:flex;gap:.5rem">
          <button onclick="navigator.clipboard?.writeText(window.location.origin+window.location.pathname).then(()=>showToast('✅ Link skopiowany!','success'))" class="btn btn-primary" style="flex:1;justify-content:center">📋 Kopiuj link</button>
          <button onclick="document.getElementById('oauth-error-modal').classList.remove('open')" class="btn btn-ghost">OK</button>
        </div>`;
      } else {
        body = `<div style="background:var(--surface2);border-radius:8px;padding:.75rem;font-size:.85rem;color:var(--muted);margin-bottom:1rem;text-align:left">${msg}</div>
        <div style="font-size:.9rem;margin-bottom:1rem;line-height:1.6">
          Jeśli otwierasz link z aplikacji Discord na telefonie — skopiuj go i otwórz w <b>Chrome</b> lub <b>Safari</b>.
        </div>
        <div style="background:var(--surface2);border-radius:6px;padding:.5rem .75rem;font-size:.75rem;color:var(--muted);word-break:break-all;margin-bottom:.75rem">${window.location.origin + window.location.pathname}</div>
        <div style="display:flex;gap:.5rem">
          <button onclick="navigator.clipboard?.writeText(window.location.origin+window.location.pathname).then(()=>showToast('✅ Link skopiowany!','success'))" class="btn btn-primary" style="flex:1;justify-content:center">📋 Kopiuj link</button>
          <button onclick="document.getElementById('oauth-error-modal').classList.remove('open')" class="btn btn-ghost">OK</button>
        </div>`;
      }
      const html = `<div style="text-align:center;padding:.5rem">
        <div style="font-size:2.5rem;margin-bottom:.75rem">${isRateLimited?'🕐':'⚠️'}</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem;letter-spacing:1px;margin-bottom:.75rem">BŁĄD LOGOWANIA DISCORD</div>
        ${body}
      </div>`;
      let modal = document.getElementById('oauth-error-modal');
      if(!modal) {
        modal = document.createElement('div');
        modal.id = 'oauth-error-modal';
        modal.className = 'modal-overlay open';
        modal.style.zIndex = '99999';
        modal.innerHTML = `<div class="modal" style="max-width:420px">${html}</div>`;
        document.body.appendChild(modal);
      } else {
        modal.querySelector('.modal').innerHTML = html;
        modal.classList.add('open');
      }
    }, 500);
  }

  if(_discordParam) {
    try {
      // '+' w base64 zamienia się w adresie na spację (np. emoji w nazwie Discord) — przywróć przed dekodowaniem
      const _b64 = _discordParam.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
      discordUser = JSON.parse(decodeURIComponent(escape(atob(_b64))));
      localStorage.setItem('nba2k_discord_user', JSON.stringify(discordUser));
      localStorage.removeItem('nba2k_discord_pending');
      window.history.replaceState({}, '', window.location.pathname);
    } catch(e) {
      console.error('Discord user parse error', e);
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => showToast('❌ Nie udało się dokończyć logowania przez Discord — spróbuj ponownie', 'error'), 800);
    }
  } else {
    try {
      // iOS Safari fallback — Worker bridge page saved user to localStorage directly
      const _pending = localStorage.getItem('nba2k_discord_pending');
      const _stored  = localStorage.getItem('nba2k_discord_user');
      if(_stored) {
        discordUser = JSON.parse(_stored);
        if(_pending) {
          localStorage.removeItem('nba2k_discord_pending');
          // Show welcome toast so user knows login worked
          setTimeout(() => showToast('✅ Zalogowano jako ' + discordUser.name, 'success'), 800);
        }
      }
    } catch(e) {}
  }

  // Link bezpośredni: przełącz widok od razu, zanim dane się wczytają
  try { openDeepLink(); } catch(e) {}
  // Always load data - credentials are embedded
  try { const lt = document.getElementById('lang-toggle'); if(lt) lt.textContent = currentLang === 'en' ? '🌐 PL' : '🌐 EN'; } catch(e) {}
  _i18nStart();
  await loadData();
  renderDashboard();
  updateAuthUI();
  try { _bnSync(document.querySelector('.view.active')?.id?.replace('view-', '') || 'dashboard'); } catch(e) {}
  // Jednorazowo po aktualizacji Workera: admin zapisuje dane, żeby Worker przeliczył dane pochodne
  if(window._needDerived && _isLoggedInSync()) setTimeout(() => _pushDerived(), 1500);
  if(_isLoggedInSync() && (events || []).some(e => e.eventsToken)) setTimeout(async () => {
    (events || []).forEach(e => { delete e.eventsToken; });
    if(await saveData(true)) showToast('🔒 Usunięto stare tokeny z danych eventów', 'success');
  }, 3000);
  if(_isLoggedInSync()) setTimeout(() => _migrateWebhooks().then(() => { try { renderSeasonSchedule(); } catch(e) {} }), 2500);
  applyLangOnLoad();
  if(discordUser) showToast((currentLang === 'en' ? '👋 Welcome ' : '👋 Witaj ') + discordUser.name + '!', 'success');
  checkEventUrlParam();
  checkPendingSignupEvent();
  openDeepLink();
  window.addEventListener('hashchange', openDeepLink);

  // Global captain watch — notify user when they become captain
  startCaptainWatch();
})();

// Track which events we've already notified the user about (captain)
const _notifiedCaptainEvents = new Set();

function startCaptainWatch() {
  if(!workerUrl) return;
  // Pre-fill: if user is already a captain, don't notify them again on page load
  if(discordUser) {
    (events||[]).forEach(ev => {
      if(['closed','draft'].includes(ev.status) && (ev.teams||[]).some(t => t.captain?.id === discordUser.id)) {
        _notifiedCaptainEvents.add(ev.id);
      }
    });
  }
  setInterval(async () => {
    if(!discordUser) return;
    try {
      const res = await fetch(workerUrl.replace(/\/$/, '') + '/data');
      if(!res.ok) return;
      const fresh = await res.json();
      const freshEvents = fresh.record?.events || fresh.events || [];

      freshEvents.forEach(ev => {
        if(!['closed','draft'].includes(ev.status)) return;
        const isCaptain = (ev.teams||[]).some(t => t.captain?.id === discordUser.id);
        if(!isCaptain) return;
        if(_notifiedCaptainEvents.has(ev.id)) {
          // Already notified — just silently update local events so button appears
          const idx = events.findIndex(e => e.id === ev.id);
          if(idx !== -1) {
            const wasUpdated = events[idx].draftTurn !== ev.draftTurn || events[idx].status !== ev.status;
            events[idx] = ev;
            if(wasUpdated) { renderEvents(); window._dataLoadedAt = ev._savedAt || Date.now(); }
          }
          return;
        }

        // First time noticing — update data + re-render (NO automatic popup — admin sends manually)
        _notifiedCaptainEvents.add(ev.id);
        const idx = events.findIndex(e => e.id === ev.id);
        if(idx !== -1) { events[idx] = ev; window._dataLoadedAt = ev._savedAt || Date.now(); }
        renderEvents();
      });
    } catch(e) {}
  }, 8000);
}

function showCaptainNotification(){return __lz(3,'showCaptainNotification',this,arguments)}


// ═══════════════════════════════════════════════════════════════
// MILESTONE BANNER
// ═══════════════════════════════════════════════════════════════
function renderMilestoneBanner() {
  const el = document.getElementById('milestone-banner');
  if(!el) return;

  const MILESTONES_PTS  = [100,250,500,1000,2000];
  const MILESTONES_REB  = [50,100,250,500];
  const MILESTONES_AST  = [50,100,250,500];
  const MILESTONES_GP   = [5,10,20,30,50];

  const agg = getAggregatedStats();
  const hits = [];

  agg.forEach(p => {
    const prev = JSON.parse(localStorage.getItem('nba2k_ms_'+p.name) || 'null') || {};
    const cur  = { pts: p.pts, reb: p.reb, ast: p.ast, gp: p.gp };

    const check = (key, milestones, icon, label) => {
      const old = prev[key] || 0;
      const now = cur[key]  || 0;
      milestones.forEach(m => {
        if(old < m && now >= m) hits.push({ player: p.name, team: p.team, icon, text: `${m} ${label}`, val: m });
      });
    };
    check('pts', MILESTONES_PTS, '🏀', t('stat_pts').replace(' (śr.)','').replace(' (avg.)','').replace(' (gem.)',''));
    check('reb', MILESTONES_REB, '💪', t('stat_reb').replace(' (śr.)','').replace(' (avg.)','').replace(' (gem.)',''));
    check('ast', MILESTONES_AST, '🎯', t('stat_ast').replace(' (śr.)','').replace(' (avg.)','').replace(' (gem.)',''));
    check('gp',  MILESTONES_GP,  '🎮', 'GP');

    // Save new state
    localStorage.setItem('nba2k_ms_'+p.name, JSON.stringify(cur));
  });

  if(!hits.length) { el.innerHTML=''; return; }

  el.innerHTML = `
    <div style="background:linear-gradient(135deg,rgba(245,197,24,.12),rgba(245,197,24,.04));border:1px solid rgba(245,197,24,.3);border-radius:12px;padding:1rem 1.25rem">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1rem;letter-spacing:2px;color:var(--accent);margin-bottom:.75rem">🏆 MILESTONES</div>
      <div style="display:flex;flex-wrap:wrap;gap:.5rem">
        ${hits.map(h => `
          <div style="background:rgba(245,197,24,.1);border:1px solid rgba(245,197,24,.25);border-radius:8px;padding:.4rem .75rem;font-size:.85rem;display:flex;align-items:center;gap:.4rem">
            <span style="font-size:1.1rem">${h.icon}</span>
            <span style="cursor:pointer;font-weight:700;color:var(--accent)" onclick="openPlayerModal('${h.player}','${h.team}')">${h.player}</span>
            <span style="color:var(--muted)">osiągnął</span>
            <span style="font-weight:700">${h.text}</span>
            <span style="color:var(--muted)">w karierze!</span>
          </div>`).join('')}
      </div>
      <div style="font-size:.72rem;color:var(--muted);margin-top:.5rem;text-align:right">kliknij gracza aby zobaczyć profil</div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════
// ROUND COMPARISON (kolejka do kolejki)
// ═══════════════════════════════════════════════════════════════
let _rcMode = 'cs';
let _rcData = null;

function setRcMode(){return __lz(3,'setRcMode',this,arguments)}

function renderRoundComparison() {
  const el = document.getElementById('round-comparison-wrap');
  if(!el) return;

  const sortedRounds = [...rounds].sort((a,b)=>a.from.localeCompare(b.from));
  if(sortedRounds.length < 2) { el.innerHTML=''; return; }

  const r1 = sortedRounds[sortedRounds.length - 2];
  const r2 = sortedRounds[sortedRounds.length - 1];

  const m1 = matches.filter(m => m.date >= r1.from && m.date <= r1.to);
  const m2 = matches.filter(m => m.date >= r2.from && m.date <= r2.to);

  if(!m1.length && !m2.length) { el.innerHTML=''; return; }

  function aggRound(ms) {
    const players = {};
    ms.forEach(m => {
      [m.team1, m.team2].forEach(t => {
        (t.players||[]).forEach(p => {
          if(!players[p.name]) players[p.name] = { name:p.name, team:t.name, gp:0, pts:0, reb:0, ast:0, stl:0, blk:0, to:0, gradeSum:0, fgm:0, fga:0 };
          const pl = players[p.name];
          pl.gp++; pl.pts+=p.pts||0; pl.reb+=p.reb||0; pl.ast+=p.ast||0;
          pl.stl+=p.stl||0; pl.blk+=p.blk||0; pl.to+=p.to||0;
          pl.gradeSum+=gradeToNum(p.grade||'B');
          pl.fgm+=p.fgm||0; pl.fga+=p.fga||0;
        });
      });
    });
    return players;
  }

  const agg1 = aggRound(m1);
  const agg2 = aggRound(m2);
  const both = Object.keys(agg2).filter(n => agg1[n]);
  if(!both.length) { el.innerHTML=''; return; }

  _rcData = { r1, r2, both, agg1, agg2, m2 };

  el.innerHTML = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:.6rem">
      <div style="display:flex;gap:.25rem;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.2rem">
        <button class="rc-toggle-btn" data-mode="cs" onclick="setRcMode('cs')"
          style="padding:.3rem .8rem;border:none;border-radius:6px;background:var(--accent);color:#000;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.85rem;cursor:pointer;transition:all .2s">CS</button>
        <button class="rc-toggle-btn" data-mode="per" onclick="setRcMode('per')"
          style="padding:.3rem .8rem;border:none;border-radius:6px;background:transparent;color:var(--muted);font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.85rem;cursor:pointer;transition:all .2s">PER</button>
      </div>
    </div>
    <div id="rc-rows-wrap"></div>`;

  renderRoundComparisonRows();
}

function renderRoundComparisonRows(){return __lz(3,'renderRoundComparisonRows',this,arguments)}


// ═══════════════════════════════════════════════════════════════
// EVENT RATINGS PANEL (dashboard)
// ═══════════════════════════════════════════════════════════════

let _evRatingsShowHist = false;
let _evRatingsByPos    = false;

function shareEventRatings(){return __lz(3,'shareEventRatings',this,arguments)}

function renderEventRatings() {
  const wrap = document.getElementById('event-ratings-wrap');
  if(!wrap) return;

  const ev = events.filter(e => (e.matches||[]).length > 0)
    .sort((a,b) => new Date(b.date||0) - new Date(a.date||0))[0];
  if(!ev) { wrap.innerHTML = ''; return; }
  const evMatchList = ev.matches || [];

  // Aggregate stats + track positions and wins
  const statsMap = {};
  evMatchList.forEach(m => {
    const t1won = (m.team1?.score ?? 0) > (m.team2?.score ?? 0);
    [m.team1, m.team2].forEach((team, ti) => {
      const won = ti === 0 ? t1won : !t1won;
      (team?.players||[]).forEach(p => {
        if(!p.name) return;
        if(!statsMap[p.name]) statsMap[p.name] = {name:p.name,gp:0,wins:0,pts:0,reb:0,ast:0,stl:0,blk:0,to:0,fgm:0,fga:0,gs:0,positions:[]};
        const s = statsMap[p.name];
        s.gp++; if(won) s.wins++;
        if(p.pos) s.positions.push(p.pos);
        s.pts+=p.pts||0; s.reb+=p.reb||0; s.ast+=p.ast||0;
        s.stl+=p.stl||0; s.blk+=p.blk||0; s.to+=p.to||0;
        s.fgm+=p.fgm||0; s.fga+=p.fga||0; s.gs+=gradeToNum(p.grade||'B');
      });
    });
  });
  if(!Object.keys(statsMap).length) { wrap.innerHTML = ''; return; }

  // Historical dominant position per player (built first — needed for histByName selection)
  const histPosCount = {};
  matches.forEach(m => {
    [m.team1, m.team2].forEach(team => {
      (team?.players||[]).forEach(p => {
        if(!p.name || !p.pos) return;
        if(!histPosCount[p.name]) histPosCount[p.name] = {};
        histPosCount[p.name][p.pos] = (histPosCount[p.name][p.pos]||0) + 1;
      });
    });
  });
  const getHistPos = name => {
    const pm = histPosCount[name];
    if(!pm) return null;
    return Object.entries(pm).sort((a,b)=>b[1]-a[1])[0][0];
  };

  // League history by player — prefer the entry for dominant historical position
  const ranking = _dsLeagueRanking();
  const allRankByName = {};
  ranking.forEach(p => {
    if(!allRankByName[p.name]) allRankByName[p.name] = [];
    allRankByName[p.name].push(p);
  });
  const histByName = {};
  Object.entries(allRankByName).forEach(([name, entries]) => {
    const domPos = getHistPos(name);
    const best = (domPos && entries.find(e => e.pos === domPos)) || entries[0];
    histByName[name] = {ovr:best.ovr, ppg:best.ppg, rpg:best.rpg, apg:best.apg, spg:best.spg, bpg:best.bpg};
  });
  const getEvPos = s => {
    if(!s.positions.length) return null;
    const pm = {};
    s.positions.forEach(p => { pm[p] = (pm[p]||0)+1; });
    return Object.entries(pm).sort((a,b)=>b[1]-a[1])[0][0];
  };

  // signupOvr: OVR frozen at registration time (the correct preOvr)
  const signupOvrByName = {};
  if((ev.players||[]).length) {
    const ingameNames = _dsIngameNames();
    (ev.players||[]).forEach(p => {
      if(p.signupOvr == null) return;
      const resolved = _dsFindIngameName(p, ingameNames, {});
      if(resolved?.name) signupOvrByName[resolved.name] = p.signupOvr;
    });
  }

  // Event average grade (position-neutral baseline for cross-position comparison)
  const evAvgGradeNum = (() => {
    const nums = Object.values(statsMap).map(s => s.gs / s.gp).filter(n => n > 0);
    return nums.length ? nums.reduce((a,b)=>a+b,0)/nums.length : 9;
  })();

  const PERF_WEIGHTS = {
    PG: {pts:0.28, stl:0.24, blk:0.22, reb:0.15, ast:0.11},
    SG: {pts:0.28, stl:0.24, blk:0.22, reb:0.15, ast:0.11},
    SF: {pts:0.20, stl:0.28, blk:0.18, reb:0.24, ast:0.10},
    PF: {pts:0.16, stl:0.30, blk:0.20, reb:0.28, ast:0.06},
    C:  {pts:0.16, stl:0.28, blk:0.22, reb:0.28, ast:0.06},
  };
  // position-neutral — must match _computeChainedOvrMap exactly
  const perf = (ppg, rpg, apg, spg, bpg) =>
    ppg*0.40 + spg*0.20 + bpg*0.18 + rpg*0.15 + apg*0.12;
  // position-weighted — only used in "Wg poz." mode
  const perfPos = (ppg, rpg, apg, spg, bpg, pos) => {
    const w = PERF_WEIGHTS[pos] || PERF_WEIGHTS.PG;
    return ppg*w.pts + spg*w.stl + bpg*w.blk + rpg*w.reb + apg*w.ast;
  };

  const calcDelta = (evPerf, baseline, winBonus) => {
    if(!baseline || baseline.ppg + baseline.rpg + baseline.apg + baseline.spg + baseline.bpg === 0) return null;
    const basePerf = perf(baseline.ppg, baseline.rpg, baseline.apg, baseline.spg, baseline.bpg);
    if(basePerf <= 0) return null;
    const pct = (evPerf - basePerf) / basePerf;
    return Math.round(Math.max(-8, Math.min(8, pct * 11 + winBonus)));
  };

  const rows = Object.values(statsMap).map(s => {
    const gp  = s.gp;
    const ppg = +(s.pts/gp).toFixed(1);
    const rpg = +(s.reb/gp).toFixed(1);
    const apg = +(s.ast/gp).toFixed(1);
    const spg = +(s.stl/gp).toFixed(1);
    const bpg = +(s.blk/gp).toFixed(1);
    const fgpct    = s.fga ? Math.round(s.fgm/s.fga*100) : null;
    const avgGrade = numToGrade(s.gs/gp);
    const hist     = histByName[s.name] || null;
    const evPos    = getEvPos(s);
    const histPos  = getHistPos(s.name);
    const posChanged = !!(hist && evPos && histPos && evPos !== histPos);
    const preOvr   = (_evRatingsByPos && posChanged)
      ? 70
      : (signupOvrByName[s.name] ?? hist?.ovr ?? 40);
    const evPerf   = perf(ppg, rpg, apg, spg, bpg);
    const wins     = s.wins;
    const losses   = gp - wins;
    const winBonus = gp > 0 ? (wins/gp - 0.5) * 10 : 0;

    let delta;
    if(!hist) {
      delta = 8; // new player debut bonus
    } else if(_evRatingsByPos && posChanged) {
      // BY-POSITION mode: compare position-weighted stats vs history at new position
      const evPerfPos = perfPos(ppg, rpg, apg, spg, bpg, evPos || 'PG');
      const bp = perfPos(hist.ppg, hist.rpg, hist.apg, hist.spg, hist.bpg, evPos || 'PG');
      const statDelta = bp > 0
        ? Math.round(Math.max(-8, Math.min(8, (evPerfPos - bp) / bp * 11 + winBonus)))
        : Math.round(Math.max(-8, Math.min(8, winBonus)));
      const gradeDelta = Math.round((s.gs/s.gp - evAvgGradeNum) / Math.max(evAvgGradeNum, 1) * 6);
      delta = Math.round(Math.max(-8, Math.min(8, statDelta * 0.75 + gradeDelta * 0.25)));
    } else {
      // SIMPLE mode (default): position-neutral, matches _computeChainedOvrMap exactly
      delta = calcDelta(evPerf, hist, winBonus);
      // Special: chemik81pl — half penalty, double reward (max +8)
      if(s.name === 'chemik81pl' && delta !== null) {
        delta = delta < 0
          ? Math.round(delta / 2)
          : Math.min(8, Math.round(delta * 2));
      }
    }

    const postOvr = Math.max(40, Math.min(99, preOvr + (delta ?? 0)));
    return {
      name:s.name, preOvr, postOvr, delta, isNew:!hist,
      wins, losses, evPos, histPos, posChanged,
      ppg, rpg, apg, spg, bpg, fgpct, gp, avgGrade,
      histPpg:hist?.ppg??null, histRpg:hist?.rpg??null,
      histApg:hist?.apg??null, histSpg:hist?.spg??null, histBpg:hist?.bpg??null
    };
  }).sort((a,b) => b.postOvr - a.postOvr);

  const ovrCell = (ovr, pre, delta) => {
    const c = _dsOvrColor(ovr);
    const badge = `<span style="background:${c};color:rgba(0,0,0,.85);border-radius:5px;padding:.15rem .45rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.95rem;min-width:34px;display:inline-block;text-align:center" title="Przed draftem: ${pre}">${ovr}</span>`;
    const arrow = (delta !== null && delta !== 0)
      ? `<span style="font-size:.72rem;font-weight:800;color:${delta>0?'var(--win)':'var(--loss)'};margin-left:.25rem">${delta>0?'▲':'▼'}${Math.abs(delta)}</span>`
      : (delta === 0 ? `<span style="font-size:.72rem;color:var(--muted);margin-left:.25rem">—</span>` : '');
    return `<span style="display:inline-flex;align-items:center;white-space:nowrap">${badge}${arrow}</span>`;
  };
  const statCell = (val, hi=false) =>
    `<span style="font-size:.85rem;font-weight:${hi?'800':'600'};color:${hi?'var(--accent)':'var(--text)'}">${val!==null?val:'—'}</span>`;
  const hCol = (label, tip='') =>
    `<th style="font-size:.7rem;color:var(--muted);font-weight:700;letter-spacing:.05em;padding:.4rem .5rem;text-align:center;white-space:nowrap" title="${tip}">${label}</th>`;

  const showHist = _evRatingsShowHist;

  wrap.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">
      <div style="padding:.85rem 1.1rem .6rem;display:flex;align-items:center;gap:.75rem;border-bottom:1px solid var(--border);flex-wrap:wrap">
        <span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.05rem;letter-spacing:1px">🎯 RANKINGI GRACZY</span>
        <span style="font-size:.8rem;color:var(--muted)">${ev.title}</span>
        <span style="font-size:.75rem;color:var(--muted);margin-left:auto">${evMatchList.length} mecze · ${rows.length} graczy</span>
        <button onclick="_evRatingsShowHist=!_evRatingsShowHist;renderEventRatings()" style="font-size:.72rem;padding:.2rem .6rem;border-radius:4px;border:1px solid var(--border);background:${showHist?'var(--accent)':'transparent'};color:${showHist?'rgba(0,0,0,.85)':'var(--text)'};cursor:pointer">${showHist ? '📊 Hist.' : '🎮 Event'}</button>
        <button onclick="shareEventRatings()" style="font-size:.72rem;padding:.2rem .6rem;border-radius:4px;border:1px solid var(--border);background:transparent;color:var(--text);cursor:pointer" title="Kopiuj obrazek do schowka">📋 Kopiuj</button>
        <button onclick="_evRatingsByPos=!_evRatingsByPos;renderEventRatings()" style="font-size:.72rem;padding:.2rem .6rem;border-radius:4px;border:1px solid var(--border);background:${_evRatingsByPos?'var(--accent)':'transparent'};color:${_evRatingsByPos?'rgba(0,0,0,.85)':'var(--text)'};cursor:pointer" title="Porównuj graczy vs ich wyniki na tej samej pozycji">📍 Wg poz.</button>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="border-bottom:1px solid var(--border)">
              <th style="font-size:.7rem;color:var(--muted);font-weight:700;padding:.4rem .5rem .4rem .9rem;text-align:left">#</th>
              <th style="font-size:.7rem;color:var(--muted);font-weight:700;padding:.4rem .5rem;text-align:left">GRACZ</th>
              ${hCol('OVR','Overall po drafcie (tooltip = przed draftem). ± uwzględnia pozycję i bilans W/L.')}
              ${hCol(showHist ? 'PPG★' : 'PPG', showHist ? 'Historyczna średnia z ligi' : 'Punkty/mecz w evencie')}
              ${hCol(showHist ? 'RPG★' : 'RPG', showHist ? 'Zbiórki/mecz (hist.)' : 'Zbiórki/mecz')}
              ${hCol(showHist ? 'APG★' : 'APG', showHist ? 'Asysty/mecz (hist.)' : 'Asysty/mecz')}
              ${hCol(showHist ? 'SPG★' : 'SPG', showHist ? 'Przechwyty/mecz (hist.)' : 'Przechwyty/mecz')}
              ${hCol(showHist ? 'BPG★' : 'BPG', showHist ? 'Bloki/mecz (hist.)' : 'Bloki/mecz')}
              ${hCol('FG%')}
              ${hCol('W-L','Wygrane-Porażki. +3 OVR przy 100% wygranych, -3 przy 100% porażkach.')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((r,i) => {
              const gradeHtml = `<span class="grade grade-${r.avgGrade.replace('+','p').replace('-','m')}" style="font-size:.7rem;padding:.05rem .3rem">${r.avgGrade}</span>`;
              const newBadge = r.isNew
                ? ' <span style="font-size:.65rem;color:var(--accent);border:1px solid var(--accent);border-radius:3px;padding:0 .2rem">NEW</span>'
                : '';
              const posBadge = r.posChanged
                ? ` <span style="font-size:.65rem;color:var(--muted);border:1px solid var(--border);border-radius:3px;padding:0 .2rem" title="Gra na ${r.evPos} (hist. ${r.histPos}) — porównanie vs avg ${r.evPos} eventu">${r.histPos}→${r.evPos}</span>`
                : '';
              const hiPpg = !showHist && r.histPpg !== null && r.ppg > r.histPpg * 1.15;
              const hiRpg = !showHist && r.histRpg !== null && r.rpg > r.histRpg * 1.15;
              const ppgVal = showHist ? (r.histPpg !== null ? r.histPpg.toFixed(1) : null) : r.ppg.toFixed(1);
              const rpgVal = showHist ? (r.histRpg !== null ? r.histRpg.toFixed(1) : null) : r.rpg.toFixed(1);
              const apgVal = showHist ? (r.histApg !== null ? r.histApg.toFixed(1) : null) : r.apg.toFixed(1);
              const spgVal = showHist ? (r.histSpg !== null ? r.histSpg.toFixed(1) : null) : r.spg.toFixed(1);
              const bpgVal = showHist ? (r.histBpg !== null ? r.histBpg.toFixed(1) : null) : r.bpg.toFixed(1);
              const wlColor = r.wins > r.losses ? 'var(--win)' : r.wins < r.losses ? 'var(--loss)' : 'var(--muted)';
              return `<tr style="border-bottom:1px solid rgba(255,255,255,.04);${i%2===1?'background:rgba(255,255,255,.015)':''}">
                <td style="padding:.5rem .5rem .5rem .9rem;color:var(--muted);font-size:.85rem;font-weight:700">${i+1}</td>
                <td style="padding:.5rem .6rem;white-space:nowrap">
                  <span style="font-weight:700;font-size:.9rem">${r.name}</span>
                  <span style="margin-left:.35rem">${gradeHtml}</span>${newBadge}${posBadge}
                </td>
                <td style="padding:.5rem;text-align:center">${ovrCell(r.postOvr, r.preOvr, r.delta)}</td>
                <td style="padding:.5rem;text-align:center">${statCell(ppgVal, hiPpg)}</td>
                <td style="padding:.5rem;text-align:center">${statCell(rpgVal, hiRpg)}</td>
                <td style="padding:.5rem;text-align:center">${statCell(apgVal)}</td>
                <td style="padding:.5rem;text-align:center">${statCell(spgVal)}</td>
                <td style="padding:.5rem;text-align:center">${statCell(bpgVal)}</td>
                <td style="padding:.5rem;text-align:center">${r.fgpct!==null?statCell(r.fgpct+'%'):statCell(null)}</td>
                <td style="padding:.5rem;text-align:center"><span style="font-size:.8rem;font-weight:700;color:${wlColor}">${r.wins}-${r.losses}</span></td>
              </tr>`;
            }).join('')}
          ${(() => {
            // NIE GRALI W TYM EVENCIE — only players who played in any OTHER event
            const playedInThisEv = new Set(Object.keys(statsMap));
            const playedInAnyEv = new Set();
            events.forEach(otherEv => {
              if(otherEv.id === ev.id) return;
              (otherEv.matches || []).forEach(m => {
                [...(m.team1?.players||[]), ...(m.team2?.players||[])].forEach(p => {
                  if(p.name) playedInAnyEv.add(p.name);
                });
              });
            });
            // Also include players from this event's earlier rounds but not in statsMap (edge case)
            const absentPlayers = [...playedInAnyEv].filter(n => !playedInThisEv.has(n));
            if(!absentPlayers.length) return '';

            const absentRows = absentPlayers.map(name => {
              const preOvr = histByName[name]?.ovr ?? 70;
              const hist   = histByName[name];
              const pos    = getHistPos(name) || '—';
              return { name, preOvr, pos,
                ppg: hist?.ppg ?? null, rpg: hist?.rpg ?? null,
                apg: hist?.apg ?? null, spg: hist?.spg ?? null, bpg: hist?.bpg ?? null };
            }).sort((a,b) => b.preOvr - a.preOvr);

            // Build nie grali rows using string concatenation to avoid nested backtick issues
            const buildOvrSpan = r => {
              const c = _dsOvrColor(r.preOvr);
              return '<span style="background:' + c + ';color:rgba(0,0,0,.85);border-radius:5px;padding:.15rem .45rem;font-family:\'Barlow Condensed\',sans-serif;font-weight:900;font-size:.95rem;min-width:34px;display:inline-block;text-align:center">' + r.preOvr + '</span>';
            };
            const buildSc = v => v !== null
              ? '<span style="font-size:.82rem;color:var(--muted)">' + v.toFixed(1) + '</span>'
              : '<span style="font-size:.8rem;color:var(--muted)">—</span>';
            const headerRow = '<tr><td colspan="10" style="padding:.4rem .9rem .2rem;font-size:.68rem;font-weight:800;letter-spacing:.1em;color:var(--muted);border-top:2px solid var(--border)">NIE GRALI W TYM EVENCIE</td></tr>';
            const absentHtml = absentRows.map(r =>
              '<tr style="border-bottom:1px solid rgba(255,255,255,.03);opacity:.45">' +
              '<td style="padding:.4rem .5rem .4rem .9rem;color:var(--muted);font-size:.8rem">—</td>' +
              '<td style="padding:.4rem .6rem;white-space:nowrap">' +
                '<span style="font-weight:600;font-size:.88rem">' + r.name + '</span>' +
                '<span style="font-size:.65rem;color:var(--muted);margin-left:.4rem;border:1px solid var(--border);border-radius:3px;padding:0 .25rem">' + r.pos + '</span>' +
                '<span style="font-size:.65rem;color:var(--muted);border:1px solid var(--border);border-radius:3px;padding:0 .25rem;margin-left:.2rem">nie grał</span>' +
              '</td>' +
              '<td style="padding:.4rem .5rem;text-align:center">' + buildOvrSpan(r) + '</td>' +
              '<td style="padding:.4rem .5rem;text-align:center">' + buildSc(r.ppg) + '</td>' +
              '<td style="padding:.4rem .5rem;text-align:center">' + buildSc(r.rpg) + '</td>' +
              '<td style="padding:.4rem .5rem;text-align:center">' + buildSc(r.apg) + '</td>' +
              '<td style="padding:.4rem .5rem;text-align:center">' + buildSc(r.spg) + '</td>' +
              '<td style="padding:.4rem .5rem;text-align:center">' + buildSc(r.bpg) + '</td>' +
              '<td style="padding:.4rem .5rem;text-align:center"><span style="font-size:.8rem;color:var(--muted)">—</span></td>' +
              '<td style="padding:.4rem .5rem;text-align:center"><span style="font-size:.8rem;color:var(--muted)">—</span></td>' +
              '</tr>'
            ).join('');
            return headerRow + absentHtml;
          })()}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════
// DISCORD SCREENSHOT QUEUE
// ═══════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════════
// TEAM REGISTRATION — NBA 2K27
// ═══════════════════════════════════════════════════════════════════════════

let _teamRegLogo = null; // base64 string

// Wysyłka zgłoszeń na osobny webhook (multipart → logo jako załącznik).
// Brak osobnego webhooka → fallback na główny kanał przez _discordNotify (bez logo).
function _dataUrlToBlob(dataUrl) {
  const [meta, b64] = dataUrl.split(',');
  const mime = (meta.match(/data:([^;]+)/) || [])[1] || 'image/png';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function _discordPost(){return __lz(3,'_discordPost',this,arguments)}

function _teamRegDiscordSend(){return __lz(3,'_teamRegDiscordSend',this,arguments)}

// ── Ustawienia kanałów Discord (webhooki zapisane tylko w Workerze) ──
let _whStatus = null; // { teams:{set,masked}, fa:{…}, schedule:{…}, streams:{…} }
async function _loadWebhookStatus() {
  if(!_isLoggedInSync()) return null;
  const r = await _api('/settings', 'GET', null, { admin: true });
  if(r.ok) _whStatus = r;
  return _whStatus;
}
const _WEBHOOK_KINDS = {
  teams: { title: '⚙ Kanał Discord — zgłoszenia drużyn', hint: 'Puste = powiadomienia idą na główny kanał ligi.' },
  schedule: { title: '⚙ Kanał Discord — terminarz', hint: 'Ogłoszenia terminarza, zapowiedzi meczów, podsumowania, nagrody, Power Ranking. Puste = główny kanał ligi.' },
  fa: { title: '⚙ Kanał Discord — wolni agenci', hint: 'Kanał forum: każdy agent dostaje własny wątek. Kanał tekstowy: zwykły post. Puste = sekret DISCORD_WEBHOOK_FREE_AGENTS (jeśli ustawiony).' },
  streams: { title: '📺 Kanał Discord — transmisje', hint: 'Powiadomienia 🔴 NA ŻYWO z linkami do streamów. Puste = kanał terminarza.' },
  results: { title: '🏀 Kanał Discord — wyniki', hint: 'Ogłoszenie z plakatem po zapisaniu wyniku (potwierdzenie przez kapitana albo wynik dodany przez admina). Puste = brak ogłoszeń wyników.' },
  achievements: { title: '🎖 Kanał Discord — osiągnięcia', hint: 'Automatyczne ogłoszenia osiągnięć zaraz po zapisaniu meczu. Puste = kanał wyników (a gdy go nie ma — kanał terminarza).' }
};
let _webhookKind = 'teams';
function openTeamRegWebhookModal(){return __lz(3,'openTeamRegWebhookModal',this,arguments)}
function openStreamsChannel(){return __lz(3,'openStreamsChannel',this,arguments)}
function openWebhookModal(){return __lz(3,'openWebhookModal',this,arguments)}
const _WH_FIELD = { teams: 'teamsWebhook', fa: 'faWebhook', schedule: 'scheduleWebhook', streams: 'streamsWebhook', results: 'resultsWebhook', achievements: 'achievementsWebhook' };
function saveWebhookSetting(){return __lz(3,'saveWebhookSetting',this,arguments)}
function testWebhookSetting(){return __lz(3,'testWebhookSetting',this,arguments)}
// Jednorazowo: przenieś stare webhooki z publicznych danych ligi do Workera
async function _migrateWebhooks() {
  if(!_isLoggedInSync()) return;
  const legacy = { teamsWebhook: discordTeamRegWebhookUrl, faWebhook: discordFreeAgentsWebhookUrl, scheduleWebhook: discordScheduleWebhookUrl };
  if(!Object.values(legacy).some(Boolean)) { await _loadWebhookStatus(); return; }
  const body = { onlyIfEmpty: true };
  Object.entries(legacy).forEach(([k, v]) => { if(v) body[k] = v; });
  const res = await _api('/settings', 'POST', body, { admin: true });
  if(!res.ok) return;
  _whStatus = res;
  discordTeamRegWebhookUrl = ''; discordFreeAgentsWebhookUrl = ''; discordScheduleWebhookUrl = '';
  if(await saveData(true)) showToast('🔒 Webhooki Discord przeniesione do Workera', 'success');
}

// ═══════════════════════════════════════════════════════════════
// API (Worker) — sesja Discord / token admina
// ═══════════════════════════════════════════════════════════════
function _h(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
function _adminToken() {
  return localStorage.getItem('nba2k_admin_token_hash') || localStorage.getItem('nba2k_events_token_hash') || '';
}
function _ensureSession() {
  if(!discordUser) { showToast('❌ Zaloguj się przez Discord', 'error'); return false; }
  if(!discordUser.session) {
    showToast('🔑 Zaloguj się ponownie przez Discord (jednorazowo)', 'info');
    setTimeout(() => loginWithDiscord(), 1200);
    return false;
  }
  return true;
}
async function _api(path, method, body, opts = {}) {
  if(window._gmDemo && /^\/gm-presence/.test(path)) return { ok: true, online: [] };
  if(window._gmDemo && /^\/gm/.test(path)) { if(!method || method === 'GET') return path.startsWith('/gm/market/bids') ? { ok: true, bids: [] } : { ...window._gmDemo.state }; showToast(_g('🎮 To demo — w prawdziwej Lidze GM ta akcja zostałaby zapisana', '🎮 This is a demo — in the real GM League this action would be saved'), 'info'); return { ok: false, error: 'demo' }; }
  if(!workerUrl) return { ok: false, error: 'Brak Worker URL' };
  const headers = { 'Content-Type': 'application/json' };
  if(opts.session && discordUser?.session) headers['X-Discord-Session'] = discordUser.session;
  if(opts.admin) headers['X-Admin-Token'] = _adminToken();
  let res, data = {};
  try {
    res = await fetch(workerUrl.replace(/\/+$/, '') + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    data = await res.json().catch(() => ({}));
  } catch(e) { return { ok: false, error: 'Błąd sieci' }; }
  // 👑 sesja admina wygasła — odnów przez Discord i powtórz zapytanie (raz)
  if(res.status === 401 && opts.admin && !opts._retry && String(_adminToken()).startsWith('adm1.') && discordUser?.session) {
    const ok = await _adminViaDiscord(true); if(ok) return _api(path, method, body, { ...opts, _retry: true });
    localStorage.removeItem('nba2k_admin_token_hash'); localStorage.removeItem('nba2k_auth'); try { updateAuthUI(); } catch(e) {}
    showToast('🔒 Sesja admina wygasła — zaloguj się ponownie przez Discord', 'error');
  }
  if(res.status === 401 && data.code === 'session' && discordUser) {
    delete discordUser.session;
    localStorage.setItem('nba2k_discord_user', JSON.stringify(discordUser));
  }
  // nieaktualny token eventów (np. po zmianie ADMIN_TOKEN_EVENTS) — usuń i zaloguj event managera od nowa przez Discord
  if(res.status === 401 && opts.admin && !localStorage.getItem('nba2k_admin_token_hash') && localStorage.getItem('nba2k_events_token_hash') && !window._evTokRefreshing) {
    window._evTokRefreshing = true;
    localStorage.removeItem('nba2k_events_token_hash'); localStorage.removeItem('nba2k_events_auth');
    if(discordUser?.session) { _eventsViaDiscord().finally(() => { window._evTokRefreshing = false; if(_isEventsAdminSync()) showToast('🔄 Odświeżono uprawnienia event managera — spróbuj jeszcze raz', 'info'); }); }
    else { window._evTokRefreshing = false; showToast('🔒 Uprawnienia event managera wygasły — zaloguj się przez Discord', 'error'); }
    try { if(typeof updateEventsAuthUI === 'function') updateEventsAuthUI(); } catch(e) {}
  }
  return { ...data, ok: res.ok, status: res.status, error: data.error || (res.ok ? null : 'HTTP ' + res.status) };
}

function toggleRegistrations(){return __lz(3,'toggleRegistrations',this,arguments)}

function setRegTab(){return __lz(3,'setRegTab',this,arguments)}

function _regTabsHtml(rightHtml) {
  const isAdmin = _isLoggedInSync();
  const pending = teamRegistrations.filter(r => r.status === 'pending').length;
  const faActive = freeAgents.filter(f => f.status === 'active').length;
  const tab = (id, label) => {
    const on = _regTab === id;
    return `<button onclick="setRegTab('${id}')" style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.05rem;letter-spacing:1px;text-transform:uppercase;padding:.4rem .9rem;border-radius:7px;border:none;cursor:pointer;background:${on ? 'var(--accent)' : 'transparent'};color:${on ? 'rgba(0,0,0,.88)' : 'var(--muted)'};white-space:nowrap">${label}</button>`;
  };
  const cnt = (n, hot) => n ? ` <span style="font-size:.75rem;background:${hot ? 'var(--loss)' : 'rgba(127,127,127,.25)'};color:${hot ? '#fff' : 'inherit'};border-radius:5px;padding:0 .35rem;vertical-align:middle">${n}</span>` : '';
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:.75rem;flex-wrap:wrap;margin-bottom:.75rem">
      <div style="display:flex;gap:.2rem;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.2rem;flex-wrap:wrap">
        ${tab('teams', '🏀 Zapisy do ligi — NBA 2K27' + (isAdmin ? cnt(pending, true) : ''))}
        ${tab('fa', '🆓 Wolni agenci' + cnt(faActive, false))}
        ${tab('tr', '🔁 Transfery')}
      </div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap">${rightHtml}</div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════
// WOLNI AGENCI
// ═══════════════════════════════════════════════════════════════
const FA_POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];
const FA_POS_NAMES = { PG:'Rozgrywający', SG:'Rzucający obrońca', SF:'Niski skrzydłowy', PF:'Silny skrzydłowy', C:'Środkowy' };
let _faPos1 = '', _faPos2 = '';

function _myActiveFa() {
  if(!discordUser) return null;
  return freeAgents.find(f => f.discordId === discordUser.id && f.status === 'active' && (!currentSeasonId || !f.seasonId || f.seasonId === currentSeasonId)) || null;
}

function setFaPosFilter(){return __lz(3,'setFaPosFilter',this,arguments)}

function renderFreeAgents(wrap) {
  const isAdmin = _isLoggedInSync();
  const mine = _myActiveFa();
  const isMine = f => discordUser && f.discordId === discordUser.id;
  const stOrder = { active: 0, signed: 1, withdrawn: 2 };

  const list = freeAgents
    .filter(f => f.status === 'active' || isAdmin || (isMine(f) && f.status === 'signed'))
    .filter(f => !_faPosFilter || f.pos1 === _faPosFilter || f.pos2 === _faPosFilter)
    .sort((a, b) => (stOrder[a.status] ?? 9) - (stOrder[b.status] ?? 9) || new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  const posBadge = (p, primary) => `<span title="${FA_POS_NAMES[p] || ''}" style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.8rem;letter-spacing:.5px;padding:.1rem .45rem;border-radius:5px;${primary ? 'background:var(--accent);color:rgba(0,0,0,.88)' : 'border:1px solid var(--accent);color:var(--accent)'}">${p}</span>`;
  const statusBadge = st => st === 'signed'
    ? '<span style="background:#16a34a;color:#fff;border-radius:4px;padding:.1rem .4rem;font-size:.65rem;font-weight:700">✅ PODPISANY</span>'
    : st === 'withdrawn' ? '<span style="background:#6b7280;color:#fff;border-radius:4px;padding:.1rem .4rem;font-size:.65rem;font-weight:700">🚫 WYCOFANE</span>' : '';
  const smallBtn = (onclick, label, color) => `<button onclick="${onclick}" class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .5rem;color:${color}">${label}</button>`;

  const cards = list.map(f => {
    const av = f.avatar
      ? `<img src="${_h(f.avatar)}" alt="" style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0">`
      : `<div style="width:44px;height:44px;border-radius:50%;background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0">👤</div>`;
    const actions = [];
    if(isMine(f) && f.status === 'active') {
      actions.push(smallBtn('openFreeAgentModal()', '✏️ Edytuj', 'var(--text)'));
      actions.push(smallBtn(`withdrawFreeAgent('${f.id}')`, '🚫 Wycofaj', 'var(--muted)'));
    }
    if(isAdmin) {
      if(f.status !== 'signed') actions.push(smallBtn(`faAdminSet('${f.id}','signed')`, '✅ Podpisany', 'var(--win)'));
      if(f.status !== 'active') actions.push(smallBtn(`faAdminSet('${f.id}','active')`, '↩ Przywróć', 'var(--muted)'));
      if(f.status === 'active' && !isMine(f)) actions.push(smallBtn(`faAdminSet('${f.id}','withdrawn')`, '🚫 Wycofaj', 'var(--loss)'));
    }
    return `
      <div style="background:var(--surface2);border:1px solid ${isMine(f) && f.status === 'active' ? 'var(--accent)' : 'var(--border)'};border-radius:10px;padding:.9rem 1.1rem;${f.status !== 'active' ? 'opacity:.65' : ''}">
        <div style="display:flex;gap:.8rem;align-items:flex-start">
          ${av}
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.3rem">
              <span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.05rem">${_h(f.name)}</span>
              ${posBadge(f.pos1, true)}${f.pos2 ? posBadge(f.pos2, false) : ''}
              ${statusBadge(f.status)}
              ${f.status === 'signed' && f.signedTeam ? `<span style="font-size:.72rem;color:var(--win);font-weight:700">→ ${_h(f.signedTeam)}</span>` : ''}
            </div>
            <div style="font-size:.75rem;color:var(--muted);margin-bottom:${f.description ? '.45rem' : '0'}">
              ${f.platform === 'xbox' ? '🎮' : '🎯'} <b style="color:var(--text)">${_h(f.gamertag)}</b> · ${(f.platform || 'psn').toUpperCase()}
              ${f.experience && _faLevel(f.experience) ? ` · <span style="color:var(--text)">${_faLevel(f.experience)}</span>` : ''}
              · ${new Date(f.updatedAt || f.createdAt).toLocaleDateString('pl-PL')}
            </div>
            ${f.description ? `<div style="font-size:.84rem;line-height:1.45;white-space:pre-wrap;word-break:break-word">${_h(f.description)}</div>` : ''}
            ${actions.length ? `<div style="display:flex;gap:.35rem;margin-top:.6rem;flex-wrap:wrap">${actions.join('')}</div>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');

  const chip = p => {
    const on = _faPosFilter === p;
    return `<button onclick="setFaPosFilter('${p}')" title="${FA_POS_NAMES[p]}" style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.8rem;padding:.2rem .6rem;border-radius:999px;cursor:pointer;border:1px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? 'rgba(245,197,24,.15)' : 'transparent'};color:${on ? 'var(--accent)' : 'var(--muted)'}">${p}</button>`;
  };

  wrap.innerHTML = _regTabsHtml(`
      ${isAdmin ? `<button onclick="openWebhookModal('fa')" class="btn btn-ghost" style="font-size:.78rem;padding:.35rem .7rem" title="Kanał Discord dla wolnych agentów">⚙ Kanał Discord${discordFreeAgentsWebhookUrl ? '' : ' <span style="color:var(--loss)">●</span>'}</button>` : ''}
      <button onclick="openFreeAgentModal()" class="btn btn-primary" style="font-size:.82rem;padding:.35rem .85rem">${mine ? '✏️ Edytuj moje zgłoszenie' : '+ Zgłoś się jako wolny agent'}</button>`) + `
    <div style="display:flex;gap:.3rem;flex-wrap:wrap;align-items:center;margin-bottom:.75rem">
      <span style="font-size:.7rem;color:var(--muted);font-weight:700;letter-spacing:1px;margin-right:.25rem">POZYCJA</span>
      ${FA_POSITIONS.map(chip).join('')}
    </div>
    ${cards
      ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:.6rem">${cards}</div>`
      : `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:2rem;text-align:center;color:var(--muted)">
          <div style="font-size:2rem;margin-bottom:.5rem">🆓</div>
          <div style="font-size:.9rem;font-weight:600;margin-bottom:.35rem">${_faPosFilter ? 'Brak wolnych agentów na pozycji ' + _faPosFilter : 'Brak wolnych agentów'}</div>
          <div style="font-size:.8rem">Szukasz drużyny? Zgłoś się — kapitanowie zobaczą Cię tutaj i na Discordzie.</div>
        </div>`}`;
}

function _faPosButtons(group) {
  const cur = group === 1 ? _faPos1 : _faPos2;
  const opts = group === 2 ? ['', ...FA_POSITIONS] : FA_POSITIONS;
  return opts.map(p => {
    const disabled = group === 2 && p && p === _faPos1;
    const on = cur === p;
    return `<button type="button" ${disabled ? 'disabled' : ''} onclick="faPickPos(${group},'${p}')" title="${p ? FA_POS_NAMES[p] : ''}"
      style="flex:1;min-width:52px;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.95rem;padding:.45rem 0;border-radius:7px;cursor:${disabled ? 'not-allowed' : 'pointer'};
      border:1px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? 'var(--accent)' : 'var(--bg)'};color:${on ? 'rgba(0,0,0,.88)' : disabled ? 'rgba(127,127,127,.4)' : 'var(--text)'}">${p || 'Brak'}</button>`;
  }).join('');
}

function faPickPos(){return __lz(3,'faPickPos',this,arguments)}

function openFreeAgentModal() {
  let m = document.getElementById('fa-modal');
  if(!m) {
    m = document.createElement('div');
    m.id = 'fa-modal';
    m.className = 'modal-overlay';
    m.style.zIndex = '1200';
    m.onclick = e => { if(e.target === m) m.classList.remove('open'); };
    m.innerHTML = '<div class="modal" style="max-width:560px"></div>';
    document.body.appendChild(m);
  }
  const box = m.querySelector('.modal');
  const close = `<button class="modal-close" onclick="document.getElementById('fa-modal').classList.remove('open')">&#x2715;</button>`;
  const title = `<div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:1px;margin-bottom:1.1rem">🆓 ${_g('Zgłoszenie — wolny agent', 'Listing — free agent')}</div>`;

  if(!discordUser || !discordUser.session) {
    box.innerHTML = close + title + `
      <div style="text-align:center;padding:1.25rem 0">
        <div style="font-size:2rem;margin-bottom:.5rem">🔒</div>
        <div style="font-size:.9rem;margin-bottom:1rem">${discordUser ? 'Zaloguj się ponownie przez Discord, aby się zgłosić.' : 'Zaloguj się przez Discord, aby się zgłosić.'}</div>
        <button class="btn btn-primary" onclick="loginWithDiscord()">Zaloguj przez Discord</button>
      </div>`;
    m.classList.add('open');
    return;
  }

  const mine = _myActiveFa();
  _faPos1 = mine?.pos1 || '';
  _faPos2 = mine?.pos2 || '';
  const inp = 'background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.5rem .7rem;font-family:inherit;font-size:.88rem;width:100%;box-sizing:border-box';
  const lbl = 'display:block;font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.35rem';
  const seasonOpts = '<option value="">— bez sezonu —</option>' + seasons.map(x => `<option value="${_h(x.id)}">${_h(x.name)}</option>`).join('');

  box.innerHTML = close + title + `
    <div style="display:flex;align-items:center;gap:.6rem;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.6rem .8rem;margin-bottom:1rem">
      ${discordUser.avatar ? `<img src="${_h(discordUser.avatar)}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover">` : ''}
      <div style="font-size:.88rem;font-weight:600">${_h(discordUser.name)}</div>
    </div>

    <div style="margin-bottom:.9rem"><label style="${lbl}">${_g('Pozycja preferowana', 'Preferred position')} <span style="color:var(--loss)">*</span></label>
      <div id="fa-pos1" style="display:flex;gap:.35rem;flex-wrap:wrap">${_faPosButtons(1)}</div></div>
    <div style="margin-bottom:.9rem"><label style="${lbl}">${_g('Druga pozycja', 'Second position')}</label>
      <div id="fa-pos2" style="display:flex;gap:.35rem;flex-wrap:wrap">${_faPosButtons(2)}</div></div>

    <div style="display:grid;grid-template-columns:1fr 110px;gap:.6rem;margin-bottom:.9rem">
      <div><label style="${lbl}">Gamertag <span style="color:var(--loss)">*</span></label>
        <input type="text" id="fa-gamertag" maxlength="32" value="${_h(mine?.gamertag || '')}" style="${inp}"></div>
      <div><label style="${lbl}">${_g('Platforma', 'Platform')}</label>
        <select id="fa-platform" style="${inp}"><option value="psn">PSN</option><option value="xbox">Xbox</option></select></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:.9rem">
      <div><label style="${lbl}">${_g('Poziom', 'Level')} <span style="color:var(--loss)">*</span></label>
        <select id="fa-experience" style="${inp}"><option value="">${_g('— wybierz —', '— choose —')}</option>${(EU_MODE ? FA_EU_LEVELS.map(l => [l, '📶 ' + l]) : Object.entries(_expLabels)).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
      <div><label style="${lbl}">${_g('Sezon', 'Season')}</label>
        <select id="fa-season" style="${inp}">${seasonOpts}</select></div>
    </div>

    <div style="margin-bottom:1rem">
      <label style="${lbl}">${_g('Opis', 'Description')} <span id="fa-desc-count" style="letter-spacing:0;font-weight:400"></span></label>
      <textarea id="fa-desc" maxlength="500" rows="4" placeholder="Doświadczenie, build, dostępność w tygodniu, czego szukasz w drużynie…" style="${inp};resize:vertical;line-height:1.4"
        oninput="document.getElementById('fa-desc-count').textContent=this.value.length+'/500'">${_h(mine?.description || '')}</textarea>
    </div>

    <label id="fa-rules-wrap" style="display:flex;align-items:flex-start;gap:.6rem;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.7rem .8rem;margin-bottom:1.25rem;cursor:pointer;font-size:.85rem;line-height:1.4">
      <input type="checkbox" id="fa-rules" onchange="document.getElementById('fa-rules-wrap').style.borderColor='var(--border)'" style="accent-color:var(--accent);width:16px;height:16px;margin-top:.1rem;flex-shrink:0;cursor:pointer">
      <span>${_g('Przeczytałem i akceptuję regulamin, który znajduje się na', 'I have read and accept the rules, which can be found on the')} <a href="${_discordInvite()}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:var(--accent)">${_g('Discordzie 2K Pro Am Ekstraklasa', '2K Pro Am Ekstraklasa Discord')}</a> <span style="color:var(--loss)">*</span></span>
    </label>

    <div style="display:flex;gap:.5rem;justify-content:flex-end">
      <button class="btn btn-ghost" onclick="document.getElementById('fa-modal').classList.remove('open')">${_g('Anuluj', 'Cancel')}</button>
      <button class="btn btn-primary" id="fa-submit-btn" onclick="submitFreeAgent()">${mine ? '💾 ' + _g('Zapisz zmiany', 'Save changes') : '📢 ' + _g('Opublikuj', 'Publish')}</button>
    </div>`;

  document.getElementById('fa-platform').value = mine?.platform || 'psn';
  document.getElementById('fa-experience').value = mine?.experience || '';
  document.getElementById('fa-season').value = mine ? (mine.seasonId || '') : (currentSeasonId || '');
  document.getElementById('fa-desc-count').textContent = (mine?.description || '').length + '/500';
  m.classList.add('open');
}

function submitFreeAgent(){return __lz(3,'submitFreeAgent',this,arguments)}

function withdrawFreeAgent(){return __lz(3,'withdrawFreeAgent',this,arguments)}

function faAdminSet(){return __lz(3,'faAdminSet',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// GŁOSOWANIE "KTO WYGRA" (terminarz)
// ═══════════════════════════════════════════════════════════════
async function _loadMyVotes() {
  if(!discordUser?.session) return;
  const res = await _api('/my-votes', 'GET', null, { session: true });
  if(res.ok) {
    myVotes = res.votes || {};
    myPredictions = res.myPredictions || {};
    myAwardVotes = res.awards || {};
    myBracket = res.bracket || {};
    myClipLikes = new Set(res.clipLikes || []);
    myProfile = res.me || null;
    mySquad = res.fantasySquad || null; _fx.draft = null;
    if(res.isAdmin && !_isLoggedInSync()) _adminViaDiscord();
    else if(res.isEventsManager && !_isEventsAdminSync()) _eventsViaDiscord();
    if(document.getElementById('view-fantasy')?.classList.contains('active')) renderFantasy();
    if(typeof updateMyPanelBadge === 'function') updateMyPanelBadge();
    if(document.getElementById('view-mypanel')?.classList.contains('active')) renderMyPanelView();
    if(typeof renderBracketDashboard === 'function') renderBracketDashboard();
    if(typeof renderSchedule === 'function') renderSchedule();
    if(typeof renderAwardsDashboard === 'function') renderAwardsDashboard();
  }
}

function _voteClosedClient(s) {
  if(s.played || s.matchId) return true;
  if(s.date) {
    const t = new Date(s.date + 'T' + (/^\d{2}:\d{2}$/.test(s.time || '') ? s.time : '23:59'));
    return Date.now() >= t.getTime();
  }
  return false;
}

function _plVotes(n) {
  if(n === 1) return 'głos';
  const d = n % 10, h = n % 100;
  return d >= 2 && d <= 4 && (h < 12 || h > 14) ? 'głosy' : 'głosów';
}

function _voteBtn(s, side) {
  if(_voteClosedClient(s)) return '';
  const k = String(s.id);
  const on = myVotes[k] === side;
  return `<button onclick="event.stopPropagation();voteSchedule('${k}','${side}')" title="Typuję, że wygra ${_h(s[side])}"
    style="margin-top:.35rem;font-size:.75rem;padding:.2rem .65rem;border-radius:999px;cursor:pointer;font-family:inherit;
    border:1px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? 'rgba(245,197,24,.15)' : 'transparent'};color:${on ? 'var(--accent)' : 'var(--muted)'}">👍${on ? ' Twój typ' : ''}</button>`;
}

function _voteBar(s, matchResult) {
  const k = String(s.id);
  const closed = !!matchResult || _voteClosedClient(s);
  return _voteBarHtml({
    c: scheduleVoteCounts[k] || { team1: 0, team2: 0 }, mine: myVotes[k], closed,
    reveal: !!myVotes[k] || closed || _isLoggedInSync(),
    winnerSide: matchResult ? _ssMatchToResult(s, matchResult).winnerSide : null
  });
}

function voteSchedule(){return __lz(3,'voteSchedule',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// TERMINARZ SEZONU — generator (jedna grupa / grupy), wybór dnia przez kapitanów, demo
// ═══════════════════════════════════════════════════════════════
const SS_DAYS = {
  mon: { label: 'Pn', full: 'Poniedziałek', off: 0 },
  wed: { label: 'Śr', full: 'Środa',        off: 2 },
  sun: { label: 'Nd', full: 'Niedziela',    off: 6 }
};
const SS_DEMO_TEAMS = ['Warsaw Wolves','Kraków Dragons','Gdańsk Sharks','Poznań Bulls','Wrocław Owls','Łódź Rhinos',
  'Katowice Comets','Lublin Hawks','Szczecin Storm','Toruń Titans','Rzeszów Rockets','Opole Outlaws'];
let _ssWeek = null;
let _ssSeasonId = null;
let _ssDraft = {};   // { scheduleId: { primary, backup } }
let _ssGen = null;   // stan okna generatora
let _demo = null;    // stan trybu demo (nic nie jest zapisywane)

// ── daty ──
function _ssAddDays(iso, n) { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function _ssMondayOf(){return __lz(3,'_ssMondayOf',this,arguments)}
function _ssNextMonday(){return __lz(3,'_ssNextMonday',this,arguments)}
function _ssFmt(iso) { return new Date(iso + 'T12:00:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric' }); }
function _ssDayDate(weekStart, day) { return _ssAddDays(weekStart, SS_DAYS[day].off); }
function _ssDayChip(weekStart, day) { return `${SS_DAYS[day].label} ${_ssFmt(_ssDayDate(weekStart, day))}`; }

function _ssShuffle(){return __lz(3,'_ssShuffle',this,arguments)}

function _ssRoundRobin(){return __lz(3,'_ssRoundRobin',this,arguments)}

function _ssDrawGroups(){return __lz(3,'_ssDrawGroups',this,arguments)}

function _ssBuildFixture(){return __lz(3,'_ssBuildFixture',this,arguments)}

// Wartość propozycji: 'mon' | 'wed' | 'sun' albo własny termin 'YYYY-MM-DD' / 'YYYY-MM-DDTHH:MM'
function _ssIsCustom(v) { return /^\d{4}-\d{2}-\d{2}/.test(v || ''); }
function _ssPickDate(ws, v) { return _ssIsCustom(v) ? v.slice(0, 10) : _ssDayDate(ws, v); }
function _ssPickTime(v) { return _ssIsCustom(v) && v.length > 10 ? v.slice(11, 16) : ''; }
function _ssPickLabel(ws, v) {
  if(!_ssIsCustom(v)) return _ssDayChip(ws, v);
  const d = new Date(v.slice(0, 10) + 'T12:00:00');
  const wd = d.toLocaleDateString('pl-PL', { weekday: 'short' }).replace('.', '');
  return `📅 ${wd.charAt(0).toUpperCase() + wd.slice(1)} ${_ssFmt(v.slice(0, 10))}${_ssPickTime(v) ? ' ' + _ssPickTime(v) : ''}`;
}
function _ssPickFull(v, ws) {
  const date = _ssPickDate(ws, v);
  const wd = new Date(date + 'T12:00:00').toLocaleDateString('pl-PL', { weekday: 'long' });
  return wd.charAt(0).toUpperCase() + wd.slice(1) + ', ' + _ssFmt(date);
}

// Okna godzinowe propozycji: 1–3 h, np. 20:00–22:00
const TW_OPTS = Array.from({ length: 25 }, (_, i) => { const m = 12 * 60 + i * 30; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + (m % 60 ? '30' : '00'); });
function _twMin(x) { return +x.slice(0, 2) * 60 + +x.slice(3, 5); }
function _twValid(f, t) { if(!f || !t) return false; const d = _twMin(t) - _twMin(f); return d >= 60 && d <= 180; }
function _tw(f, t) { return f && t ? `${f}–${t}` : ''; }
function _twWin(pick, day) {
  if(!pick) return null;
  if(pick.primary === day && pick.primaryFrom) return { f: pick.primaryFrom, t: pick.primaryTo };
  if(pick.backup === day && pick.backupFrom) return { f: pick.backupFrom, t: pick.backupTo };
  return null;
}
function _twOverlap(a, b) {
  if(!a || !b) return null;
  const f = Math.max(_twMin(a.f), _twMin(b.f)), t = Math.min(_twMin(a.t), _twMin(b.t));
  if(t - f < 30) return null;
  const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  return { f: hm(f), t: hm(t) };
}
function _dowOfPick(ws, v) { return (new Date(_ssPickDate(ws, v) + 'T12:00:00').getDay() + 6) % 7; }

function _ssSuggest(p, ws) {
  const a = p?.team1, b = p?.team2;
  if(!a || !b) return null;
  const withWin = (day, kind) => {
    const wa = _twWin(a, day), wb = _twWin(b, day);
    const ov = _twOverlap(wa, wb);
    return { day, kind, overlap: ov, wa, wb, time: ov?.f || null };
  };
  if(a.primary === b.primary) return withWin(a.primary, 'match');
  const aSet = [a.primary, a.backup], bSet = [b.primary, b.backup];
  const cands = [];
  if(bSet.includes(a.primary)) cands.push(a.primary);
  if(aSet.includes(b.primary)) cands.push(b.primary);
  if(cands.length) {
    const opts = cands.map(d => withWin(d, 'partial')).sort((x, y) => (!!y.overlap - !!x.overlap) || _ssPickDate(ws, x.day).localeCompare(_ssPickDate(ws, y.day)));
    return opts[0];
  }
  if(a.backup === b.backup) return withWin(a.backup, 'backup');
  return { day: null, kind: 'none' };
}

// ── kontekst (prawdziwe dane / demo) ──
function _ssApprovedTeams(seasonId) {
  return teamRegistrations
    .filter(r => r.status === 'approved' && (!seasonId || !r.seasonId || r.seasonId === seasonId))
    .map(r => r.teamName);
}

function _ssRealCtx() {
  const withFixture = seasons.filter(x => x.fixture);
  if(!_ssSeasonId || !seasons.find(x => x.id === _ssSeasonId)) {
    _ssSeasonId = (seasons.find(x => x.id === currentSeasonId && x.fixture) || withFixture[withFixture.length - 1] || {}).id || currentSeasonId || null;
  }
  const season = seasons.find(x => x.id === _ssSeasonId) || null;
  const items = schedule.filter(s => s.generated && (s.seasonId || null) === (_ssSeasonId || null));
  const myTeam = discordUser
    ? (teamRegistrations.find(r => r.status === 'approved' && r.captain?.id === discordUser.id && (!_ssSeasonId || !r.seasonId || r.seasonId === _ssSeasonId))?.teamName || null)
    : null;
  return { demo: false, season, seasonId: _ssSeasonId, fixture: season?.fixture || null, items,
    picks: scheduleDayPicks, counts: scheduleVoteCounts, myVotes, isAdmin: _isLoggedInSync(), myTeam,
    seasonsWithFixture: withFixture };
}

function _ssDemoCtx() {
  return { demo: true, season: { name: 'Sezon DEMO' }, seasonId: 'demo', fixture: _demo.fixture, items: _demo.items,
    picks: _demo.picks, counts: _demo.counts, myVotes: _demo.myVotes,
    isAdmin: _demo.role === 'admin', myTeam: _demo.role === 'captain' ? _demo.captainTeam : null, seasonsWithFixture: [] };
}

function _ssCtx() { return _demo ? _ssDemoCtx() : _ssRealCtx(); }
function _ssItem(k) { return (_demo ? _demo.items : schedule).find(x => String(x.id) === String(k)); }

function _ssMatchIds(s) {
  return Array.isArray(s.matchIds) && s.matchIds.length ? s.matchIds : (s.matchId ? [s.matchId] : []);
}

function _ssSeries(games, bestOf) {
  if(!games || !games.length) return null;
  const w1 = games.filter(g => g.s1 > g.s2).length, w2 = games.filter(g => g.s2 > g.s1).length;
  const done = games.length >= (bestOf || 1);
  const winnerSide = done ? (w1 > w2 ? 'team1' : w2 > w1 ? 'team2' : null) : null;
  return { games, w1, w2, done, winnerSide, draw: done && w1 === w2 };
}

function _ssResult(ctx, s) {
  if(ctx.demo) {
    const r = _demo.results[String(s.id)];
    return r ? _ssSeries(r.games, s.bestOf) : null;
  }
  const games = _ssMatchIds(s)
    .map(id => matches.find(x => Number(x.id) === Number(id)))
    .filter(Boolean)
    .map(m => { const r = _ssMatchToResult(s, m); return { s1: r.s1, s2: r.s2, matchId: m.id }; });
  return _ssSeries(games, s.bestOf);
}

function _ssMatchToResult(s, m) {
  const swapped = m.team1.name === s.team2 || m.team2.name === s.team1;
  const s1 = swapped ? m.team2.score : m.team1.score;
  const s2 = swapped ? m.team1.score : m.team2.score;
  return { s1, s2, winnerSide: s1 > s2 ? 'team1' : 'team2' };
}

// ── głosowanie (wspólny pasek dla Harmonogramu i terminarza sezonu) ──
function _voteBarHtml({ c, mine, closed, reveal, winnerSide, draw }) {
  const d0 = c.draw || 0;
  const total = (c.team1 || 0) + (c.team2 || 0) + d0;
  const note = txt => `<div style="text-align:center;font-size:.72rem;color:var(--muted);margin-top:.6rem">${txt}</div>`;
  if(!reveal) return note(total ? `🗳 ${total} ${_plVotes(total)} · zagłosuj 👍, aby zobaczyć wyniki` : '🗳 Kto wygra? Zagłosuj 👍');
  if(!total) return closed ? '' : note('🗳 Brak głosów — bądź pierwszy');

  const p1 = Math.round((c.team1 || 0) / total * 100), pd = Math.round(d0 / total * 100), p2 = Math.max(0, 100 - p1 - pd);
  const top = Math.max(p1, p2, pd);
  const lead = [p1, pd, p2].filter(x => x === top).length > 1 ? 0 : top === p1 ? 1 : top === p2 ? 2 : 3;
  const pct = (v, on) => `<span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1rem;color:${on ? 'var(--accent)' : 'var(--muted)'}">${v}%</span>`;

  let verdict = '';
  const outcome = winnerSide || (draw ? 'draw' : null);
  if(outcome) {
    const share = outcome === 'team1' ? p1 : outcome === 'team2' ? p2 : pd;
    const favourite = { 1: 'team1', 2: 'team2', 3: 'draw' }[lead];
    verdict = outcome === 'draw'
      ? (pd ? (favourite === 'draw' ? `🎯 Remis! Kibice trafili — ${pd}% typowało remis` : `🤝 Remis — typowało go ${pd}% kibiców`) : '🤝 Remis — nikt go nie typował')
      : lead === 0
        ? '🤝 Kibice byli podzieleni'
        : favourite === outcome
          ? `🎯 Kibice trafili — ${share}% typowało zwycięzcę`
          : `😮 Niespodzianka — tylko ${share}% typowało zwycięzcę`;
    if(mine) verdict += mine === outcome ? ' · ✅ Twój typ trafiony' : ' · ❌ Twój typ nietrafiony';
  }
  return `
    <div style="margin-top:.7rem">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:.25rem">
        ${pct(p1, lead === 1)}
        <span style="font-size:.68rem;color:var(--muted)">🗳 ${total} ${_plVotes(total)}${d0 ? ` · 🤝 remis <b style="color:${lead === 3 ? 'var(--accent)' : 'var(--text)'}">${pd}%</b>` : ''}${closed && !outcome ? ' · głosowanie zakończone' : ''}</span>
        ${pct(p2, lead === 2)}
      </div>
      <div style="display:flex;height:6px;border-radius:3px;overflow:hidden;background:var(--surface2)">
        <div style="width:${p1}%;background:var(--accent);transition:width .3s"></div>
        ${pd ? `<div style="width:${pd}%;background:#94a3b8;transition:width .3s"></div>` : ''}
        <div style="width:${p2}%;background:#3b82f6;transition:width .3s"></div>
      </div>
      ${verdict ? `<div style="text-align:center;font-size:.75rem;margin-top:.4rem;font-weight:600">${verdict}</div>` : ''}
    </div>`;
}

function _ssVoteClosed(ctx, s) { return !!_ssResult(ctx, s) || _voteClosedClient(s); }

function _ssVoteBtn(ctx, s, side) {
  if(_ssVoteClosed(ctx, s)) return '';
  const k = String(s.id);
  const on = ctx.myVotes[k] === side;
  const fn = ctx.demo ? `demoVote('${k}','${side}')` : `voteSchedule('${k}','${side}')`;
  if(side === 'draw') return `<button onclick="event.stopPropagation();${fn}" title="Typuję remis ${(s.bestOf || 2) / 2}:${(s.bestOf || 2) / 2}"
    style="margin-top:.35rem;font-size:.72rem;padding:.18rem .7rem;border-radius:999px;cursor:pointer;font-family:inherit;font-weight:700;
    border:1px solid ${on ? '#94a3b8' : 'var(--border)'};background:${on ? 'rgba(148,163,184,.18)' : 'transparent'};color:${on ? 'var(--text)' : 'var(--muted)'}">🤝 Remis ${(s.bestOf || 2) / 2}:${(s.bestOf || 2) / 2}${on ? ' · Twój typ' : ''}</button>`;
  return `<button onclick="event.stopPropagation();${fn}" title="Typuję, że wygra ${_h(s[side])}"
    style="margin-top:.35rem;font-size:.75rem;padding:.2rem .65rem;border-radius:999px;cursor:pointer;font-family:inherit;
    border:1px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? 'rgba(245,197,24,.15)' : 'transparent'};color:${on ? 'var(--accent)' : 'var(--muted)'}">👍${on ? ' Twój typ' : ''}</button>`;
}

function _ssVoteBar(ctx, s) {
  const k = String(s.id);
  const res = _ssResult(ctx, s);
  const closed = _ssVoteClosed(ctx, s);
  return _voteBarHtml({
    c: ctx.counts[k] || { team1: 0, team2: 0 }, mine: ctx.myVotes[k],
    closed, reveal: !!ctx.myVotes[k] || closed || ctx.isAdmin, winnerSide: res?.winnerSide || null, draw: !!res?.draw
  });
}

// ── render ──
function renderSeasonSchedule() {
  const el = document.getElementById('season-schedule-wrap');
  if(!el) return;
  const ctx = _ssCtx();
  const isRealAdmin = !ctx.demo && _isLoggedInSync();

  const publicDemo = !ctx.demo && !isRealAdmin && !ctx.items.length;

  const btn = (onclick, label, primary) => `<button onclick="${onclick}" class="btn ${primary ? 'btn-primary' : 'btn-ghost'}" style="font-size:.78rem;padding:.35rem .75rem">${label}</button>`;
  const formatBadge = ctx.fixture
    ? `<span style="font-size:.72rem;font-weight:700;color:var(--accent);border:1px solid var(--accent);border-radius:5px;padding:.05rem .45rem;vertical-align:middle">${ctx.fixture.format === 'groups' ? '👥 ' + ctx.fixture.groups.length + ' grupy' : '🏟 Jedna grupa'}</span>` : '';

  const seasonSel = !ctx.demo && ctx.seasonsWithFixture.length > 1
    ? `<select onchange="_ssSeasonId=this.value;_ssWeek=null;renderSeasonSchedule()" style="width:auto;max-width:220px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .5rem;font-family:inherit;font-size:.8rem">
        ${ctx.seasonsWithFixture.map(x => `<option value="${_h(x.id)}" ${x.id === ctx.seasonId ? 'selected' : ''}>${_h(x.name)}</option>`).join('')}</select>` : '';

  const header = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:.75rem;flex-wrap:wrap;margin-bottom:.75rem">
      <div class="section-title" style="margin-bottom:0">🗓 Terminarz sezonu ${ctx.season ? '<span style="color:var(--muted);font-size:.8em">— ' + _h(ctx.season.name) + '</span>' : ''} ${formatBadge}</div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center">
        ${!ctx.demo && ctx.items.length ? btn(`copyDeepLink('terminarz-week-${_ssWeek || 1}')`, '🔗 Link', false) : ''}
        ${seasonSel}
        ${ctx.demo
          ? btn('openFixtureGenerator()', '⚙ Generuj (demo)', false) + btn('endDemo()', '✕ Zakończ demo', false)
          : isRealAdmin ? btn("openAdminHub('sezon')", '🛠 Narzędzia admina', false) + btn('openFixtureGenerator()', '⚙ Generuj terminarz', true)
          : publicDemo ? btn('startDemo()', '❓ Jak to działa? (demo)', true) : ''}
      </div>
    </div>`;

  const demoBar = ctx.demo ? (() => {
    const roleBtn = (r, label) => `<button onclick="demoSetRole('${r}')" style="font-size:.75rem;padding:.25rem .6rem;border-radius:6px;cursor:pointer;font-family:inherit;border:1px solid ${_demo.role === r ? 'var(--accent)' : 'var(--border)'};background:${_demo.role === r ? 'var(--accent)' : 'transparent'};color:${_demo.role === r ? 'rgba(0,0,0,.88)' : 'var(--text)'}">${label}</button>`;
    return `
      <div style="background:rgba(245,197,24,.08);border:1px dashed var(--accent);border-radius:10px;padding:.7rem .9rem;margin-bottom:1rem">
        <div style="font-size:.8rem;font-weight:700;margin-bottom:.5rem">🧪 TRYB DEMO — to NIE jest prawdziwy terminarz. Przykładowe drużyny, nic nie jest zapisywane ani wysyłane na Discord.</div>
        <div style="display:flex;gap:.35rem;flex-wrap:wrap;align-items:center;font-size:.75rem">
          <span style="color:var(--muted)">Widzisz jako:</span>
          ${roleBtn('admin', '👑 Admin')}
          ${roleBtn('captain', '🏀 Kapitan')}
          ${_demo.role === 'captain' ? `<select onchange="demoSetCaptain(this.value)" style="width:auto;max-width:220px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.2rem .4rem;font-family:inherit;font-size:.75rem">${_demo.teams.map(t => `<option ${t === _demo.captainTeam ? 'selected' : ''}>${_h(t)}</option>`).join('')}</select>` : ''}
          ${roleBtn('fan', '👤 Kibic')}
        </div>
      </div>`;
  })() : '';

  if(publicDemo) {
    el.innerHTML = header + `
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1.25rem;text-align:center;color:var(--muted);font-size:.85rem;line-height:1.5">
        Terminarz pojawi się po zamknięciu zapisów. Kapitanowie wybiorą wtedy przy każdym meczu dzień priorytetowy i zapasowy (Pn / Śr / Nd), a kibice zagłosują, kto wygra.<br>
        Kliknij <b>❓ Jak to działa?</b>, żeby przetestować to na przykładowych drużynach.
      </div>`;
    return;
  }

  if(!ctx.items.length) {
    const teams = _ssApprovedTeams(ctx.seasonId);
    el.innerHTML = header + demoBar + `
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1.5rem;text-align:center;color:var(--muted);font-size:.85rem;line-height:1.5">
        Brak terminarza dla tego sezonu. Zatwierdzone drużyny: <b style="color:var(--text)">${teams.length}</b>.<br>
        Kliknij <b>⚙ Generuj terminarz</b>, gdy zapisy będą zamknięte, albo <b>🧪 Demo</b>, żeby zobaczyć, jak to działa.
      </div>`;
    return;
  }

  // grupy
  const groups = ctx.fixture?.format === 'groups' ? ctx.fixture.groups : [];
  const groupName = id => groups.find(g => g.id === id)?.name || '';
  const groupsHtml = groups.length ? `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.5rem;margin-bottom:1rem">
      ${groups.map(g => `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.6rem .8rem">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;letter-spacing:1px;color:var(--accent);margin-bottom:.3rem">${_h(g.name)}</div>
        ${g.teams.map(t => `<div style="font-size:.8rem;padding:.1rem 0;${ctx.myTeam === t ? 'color:var(--accent);font-weight:700' : ''}">${_ssTeamName(ctx, t)}</div>`).join('')}
      </div>`).join('')}
    </div>` : '';

  // tygodnie
  const weeks = [...new Set(ctx.items.map(s => s.week))].sort((a, b) => a - b);
  const weekDone = w => ctx.items.filter(s => s.week === w).every(s => _ssResult(ctx, s)?.done);
  if(!weeks.includes(_ssWeek)) _ssWeek = weeks.find(w => !weekDone(w)) || weeks[weeks.length - 1];
  const weekStart = w => ctx.items.find(s => s.week === w)?.weekStart;
  const tabs = weeks.map(w => {
    const on = w === _ssWeek, ws = weekStart(w);
    return `<button onclick="_ssWeek=${w};renderSeasonSchedule()" style="flex-shrink:0;padding:.35rem .7rem;border-radius:8px;cursor:pointer;font-family:inherit;text-align:center;line-height:1.2;
      border:1px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? 'var(--accent)' : 'var(--surface2)'};color:${on ? 'rgba(0,0,0,.88)' : 'var(--text)'}">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.95rem">${weekDone(w) ? '✓ ' : ''}Week ${w}</div>
      ${ws ? `<div style="font-size:.62rem;opacity:.8">${_ssFmt(ws)}–${_ssFmt(_ssAddDays(ws, 6))}</div>` : ''}
    </button>`;
  }).join('');

  const weekItems = ctx.items.filter(s => s.week === _ssWeek).sort((a, b) => (a.round || 0) - (b.round || 0));
  const byGroup = groups.length ? groups.map(g => ({ g, list: weekItems.filter(s => s.groupId === g.id) })) : [{ g: null, list: weekItems }];
  const byes = (ctx.fixture?.byes?.[_ssWeek] || []);

  el.innerHTML = header + demoBar + _ssToolsHtml(ctx) + groupsHtml + `
    ${_ssScheduledList(ctx, groupName)}
    <div style="display:flex;gap:.35rem;overflow-x:auto;padding-bottom:.4rem;margin:1.25rem 0 .75rem">${tabs}</div>
    ${byGroup.map(({ g, list }) => `
      ${g ? `<div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.4rem 0 .4rem;text-transform:uppercase">${_h(g.name)}</div>` : ''}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:.6rem;margin-bottom:.5rem">
        ${list.map(s => _ssCard(ctx, s, groupName)).join('')}
      </div>`).join('')}
    ${byes.length ? `<div style="font-size:.78rem;color:var(--muted);margin-top:.25rem">💤 Pauzuje: ${byes.map(b => _h(b.team) + ' (' + [groupName(b.groupId), b.round ? 'kolejka ' + b.round : ''].filter(Boolean).join(', ') + ')').join(', ')}</div>` : ''}
    ${_predCardHtml(ctx)}
    ${_typerHtml(ctx)}`;
}

function _ssScheduledList(ctx, groupName) {
  const list = ctx.items
    .filter(s => s.date && !_ssResult(ctx, s)?.done)
    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  const today = new Date().toISOString().slice(0, 10);
  const rows = list.map(s => {
    const k = String(s.id);
    const d = new Date(s.date + 'T12:00:00');
    const wd = d.toLocaleDateString('pl-PL', { weekday: 'short' }).replace('.', '');
    const isToday = s.date === today;
    const res = _ssResult(ctx, s);
    return `
      <div style="display:grid;grid-template-columns:92px 1fr auto;align-items:center;gap:.75rem;padding:.55rem .8rem;border-bottom:1px solid var(--border);${isToday ? 'background:rgba(245,197,24,.07)' : ''}">
        <div style="line-height:1.15">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1rem;${isToday ? 'color:var(--accent)' : ''}">${isToday ? 'DZIŚ' : wd.charAt(0).toUpperCase() + wd.slice(1) + ' ' + _ssFmt(s.date)}</div>
          <div style="font-size:.72rem;color:var(--muted)">${s.time || ''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:.5rem;min-width:0;flex-wrap:wrap">
          ${teamLogo(s.team1, 24, '.6rem')}<b style="font-size:.85rem">${_ssTeamName(ctx, s.team1)}</b>
          <span style="color:var(--muted);font-size:.75rem">${res ? res.w1 + ':' + res.w2 : 'vs'}</span>
          <b style="font-size:.85rem">${_ssTeamName(ctx, s.team2)}</b>${teamLogo(s.team2, 24, '.6rem')}
          <span style="font-size:.68rem;color:var(--muted);margin-left:.25rem">${groupName(s.groupId) ? _h(groupName(s.groupId)) + ' · ' : ''}Week ${s.week}${(s.bestOf || 1) > 1 ? ' · Bo' + s.bestOf : ''}</span>
          ${!ctx.demo && _isLive(s) ? '<span style="background:#dc2626;color:#fff;font-size:.6rem;font-weight:900;border-radius:4px;padding:.05rem .35rem">🔴 NA ŻYWO</span>' : ''}
          ${!ctx.demo ? _streamLinks(s, true) : ''}
        </div>
        <div style="display:flex;gap:.3rem">
          <button onclick="_ssWeek=${s.week};renderSeasonSchedule()" class="btn btn-ghost" style="font-size:.68rem;padding:.2rem .45rem" title="Pokaż w tygodniu">👁</button>
          ${ctx.demo ? '' : `<button onclick="ssCalendarSingle('${k}')" class="btn btn-ghost" style="font-size:.68rem;padding:.2rem .45rem" title="Dodaj do kalendarza">📆</button>`}
          ${ctx.isAdmin && !ctx.demo ? `<button onclick="ssResendMatch('${k}')" class="btn btn-ghost" style="font-size:.68rem;padding:.2rem .45rem" title="Wyślij ponownie na Discord">📣</button>` : ''}
        </div>
      </div>`;
  }).join('');
  return `
    <div style="margin-top:.25rem">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.05rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem">📅 Umówione mecze (${list.length})</div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">
        ${rows || '<div style="padding:1.1rem;text-align:center;color:var(--muted);font-size:.85rem">Jeszcze żaden termin nie został zatwierdzony</div>'}
      </div>
    </div>`;
}

function _ssTeamName(ctx, t) {
  return _h(t) + (ctx.demo ? ' <span style="font-size:.7em;font-weight:600;color:var(--muted);letter-spacing:0">(demo)</span>' : '');
}

function _ssCard(ctx, s, groupName) {
  const k = String(s.id);
  const res = _ssResult(ctx, s);
  const isFinal = !!s.date;
  const bo = s.bestOf || 1;
  const status = res
    ? (res.done ? `<span style="color:var(--win);font-weight:700">✅ Rozegrany</span>` : `<span style="color:var(--accent);font-weight:700">▶ Mecz ${res.games.length}/${bo} rozegrany</span>`)
    : isFinal
      ? `<span style="color:var(--win);font-weight:700">📅 ${new Date(s.date + 'T12:00:00').toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'numeric' })}${s.time ? ' · ' + s.time : ''}</span>`
      : `<span style="color:var(--muted)">⏳ Termin do ustalenia</span>`;
  const mineSide = ctx.myTeam && [s.team1, s.team2].map(x => String(x).toLowerCase()).includes(ctx.myTeam.toLowerCase());
  const teamCol = (side, align) => `
    <div style="flex:1;min-width:0;text-align:${align};display:flex;flex-direction:column;align-items:${align === 'right' ? 'flex-end' : 'flex-start'};gap:.3rem">
      <div ${ctx.demo ? '' : `onclick="openTeamModal(this.dataset.t)" data-t="${_h(s[side])}" title="${_g('Karta drużyny', 'Team card')}"`} style="display:flex;flex-direction:column;align-items:inherit;gap:.3rem;${ctx.demo ? '' : 'cursor:pointer'}">
      ${teamLogo(s[side], 38, '.85rem')}
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.05rem;${res && res.winnerSide === side ? 'color:var(--accent)' : ''};line-height:1.15;word-break:break-word">${_ssTeamName(ctx, s[side])}</div>
      </div>
      ${_ssVoteBtn(ctx, s, side)}
    </div>`;

  return `
    <div style="background:var(--surface);border:1px solid ${mineSide && !res ? 'var(--accent)' : 'var(--border)'};border-radius:12px;padding:.85rem 1rem">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:.72rem;margin-bottom:.6rem;gap:.5rem">
        <span style="color:var(--muted)">${s.makeup ? `<b style="color:#f59e0b">⏰ ${_g('Zaległy', 'Make-up')}${s.ruleUntil ? ' · ' + _g('do', 'by') + ' ' + _ssFmt(s.ruleUntil) : ''}</b> · ` : ''}${!ctx.demo && _isClassic(s.team1, s.team2) ? `<b style="color:#f97316;cursor:pointer" onclick="openRivalry(this.dataset.a, this.dataset.b)" data-a="${_h(s.team1)}" data-b="${_h(s.team2)}" title="${_g('Zobacz rywalizację', 'See the rivalry')}">🔥 ${_h(_rivName(s.team1, s.team2) || 'Klasyk')}</b> · ` : ''}${groupName(s.groupId) ? _h(groupName(s.groupId)) + ' · ' : ''}Week ${s.week}${s.round ? ' · Kolejka ' + s.round : ''}${bo > 1 ? ' · <b style="color:var(--text)">Bo' + bo + '</b>' : ''}</span>
        ${status}
      </div>
      <div style="display:flex;align-items:center;gap:.6rem">
        ${teamCol('team1', 'right')}
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:${res ? '1.25rem' : '.95rem'};color:${res ? 'var(--text)' : 'var(--muted)'};min-width:56px;text-align:center">${res ? res.w1 + ' — ' + res.w2 : 'VS'}</div>
        ${teamCol('team2', 'left')}
      </div>
      ${res && bo > 1 ? `<div style="text-align:center;font-size:.7rem;color:var(--muted);margin-top:.3rem">${res.games.map((g, i) => `Mecz ${i + 1}: <b style="color:var(--text)">${g.s1}:${g.s2}</b>${g.matchId ? ` <span onclick="openMatchPoster(${g.matchId})" title="Plakat meczu" style="cursor:pointer">🖼</span>` : ''}`).join(' · ')}</div>` : ''}
      ${(bo % 2 === 0) && !_ssVoteClosed(ctx, s) ? `<div style="text-align:center">${_ssVoteBtn(ctx, s, 'draw')}</div>` : ''}
      ${!ctx.demo && !res ? _eloLine(s) : ''}
      ${!ctx.demo ? (() => {
        const live = _isLive(s), sl = _streamLinks(s, true), nClips = _clipsFor(String(s.id)).length;
        const canStream = ctx.isAdmin || (ctx.myTeam && [s.team1, s.team2].some(t => String(t).toLowerCase() === ctx.myTeam.toLowerCase()));
        return `<div style="display:flex;gap:.45rem;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:.45rem">
          ${live ? '<span style="background:#dc2626;color:#fff;font-size:.62rem;font-weight:900;letter-spacing:1px;border-radius:4px;padding:.05rem .4rem">🔴 NA ŻYWO</span>' : ''}
          ${sl}
          ${ctx.isAdmin ? (() => { const ids = (s.matchIds || (s.matchId ? [s.matchId] : [])).map(String); if(!ids.length) return '';
            return ids.map((mid, n) => { const mm = _withAllMatches(() => matches.find(x => String(x.id) === mid)); if(!mm) return '';
              const lbl = ids.length > 1 ? `📣 ${_g('Mecz', 'Game')} ${n + 1}` : `📣 ${_g('Ogłoś wynik', 'Post result')}`, sc = `${mm.team1.name} ${mm.team1.score}:${mm.team2.score} ${mm.team2.name}`;
              return `<button onclick="if(confirm(_g('Ogłosić na kanale wyników mecz: ', 'Post this game to the results channel: ') + this.dataset.sc + '?')) _announceResult('${mid}','${s.id}',true).then(ok=>showToast(ok?'📣 OK':'❌', ok?'success':'error'))" data-sc="${_h(sc)}" class="btn btn-ghost" title="${_h(sc)}" style="font-size:.66rem;padding:.12rem .45rem">${lbl}</button>`; }).join(''); })() : ''}
          ${sl && !_ssResult(ctx, s)?.done ? `<button onclick="openMultistream('${s.id}')" class="btn ${live || s.date === new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' }) ? 'btn-primary' : 'btn-ghost'}" title="${_g('Obie transmisje obok siebie', 'Both streams side by side')}" style="font-size:.66rem;padding:.12rem .45rem">🖥️ Multistream</button>` : ''}
          ${canStream && !_ssResult(ctx, s)?.done ? `<button onclick="openStreamModal('${s.id}')" class="btn btn-ghost" style="font-size:.66rem;padding:.12rem .45rem">📺 ${sl ? 'Transmisja' : 'Dodaj transmisję'}</button>` : ''}
          <button onclick="openClips('${s.id}')" class="btn btn-ghost" style="font-size:.66rem;padding:.12rem .45rem">🎬 Akcje${nClips ? ' (' + nClips + ')' : ''}</button>
          <button onclick="openMatchCenter('${s.id}')" class="btn btn-ghost" style="font-size:.66rem;padding:.12rem .45rem;border-color:var(--accent);color:var(--accent)">🏟️ ${_g('Centrum meczu', 'Match center')}</button>
          <button onclick="openScoutReport('${s.id}')" class="btn btn-ghost" style="font-size:.66rem;padding:.12rem .45rem">🔍 ${_g('Raport rywala', 'Scouting')}</button>
          <button onclick="openRivalry(this.dataset.a, this.dataset.b)" data-a="${_h(s.team1)}" data-b="${_h(s.team2)}" class="btn btn-ghost" style="font-size:.66rem;padding:.12rem .45rem">⚔️ H2H</button>
        </div>`;
      })() : ''}
      ${_ssVoteBar(ctx, s)}
      ${!ctx.demo && res ? _reactBar('s' + s.id) : ''}
      ${res ? '' : _ssDaySection(ctx, s)}
      ${_ssResultsBlock(ctx, s)}
      ${_ssAdminActions(ctx, s, res)}
    </div>`;
}

function _ssDaySection(ctx, s) {
  const k = String(s.id);
  const p = ctx.picks[k] || {};
  const isFinal = !!s.date;
  const ws = s.weekStart;
  const chip = (day, kind, pk) => { const w = pk ? _tw(pk[kind + 'From'], pk[kind + 'To']) : '';
    return `<span title="${_ssPickFull(day, ws)}${w ? ', ' + w : ''}" style="display:inline-block;font-size:.72rem;padding:.12rem .45rem;border-radius:5px;margin:.1rem .15rem 0 0;
    ${kind === 'primary' ? 'background:var(--accent);color:rgba(0,0,0,.88);font-weight:700' : 'border:1px solid var(--border);color:var(--muted)'}">${kind === 'primary' ? '⭐ ' : '↺ '}${_ssPickLabel(ws, day)}${w ? ' · ' + w : ''}</span>`; };

  const col = side => {
    const pk = p[side];
    const isMine = ctx.myTeam && ctx.myTeam.toLowerCase() === String(s[side]).toLowerCase();
    const head = `<div style="font-size:.66rem;color:var(--muted);font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:.2rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${isMine ? '🏀 Ty · ' : ''}${_h(s[side])}</div>`;
    const av = ctx.demo ? '' : _availLine(s[side], s);
    if(isMine && !isFinal) {
      const assist = !ctx.demo && !p[side] ? _ssSlotsHtml(k, s, true) : '';
      const op = p[side === 'team1' ? 'team2' : 'team1'];
      const acc = !ctx.demo && op ? `<div style="background:rgba(22,163,74,.08);border:1px solid rgba(22,163,74,.45);border-radius:8px;padding:.4rem .5rem;margin-bottom:.45rem">
        <div style="font-size:.64rem;font-weight:800;letter-spacing:.5px;color:var(--win);margin-bottom:.25rem">PASUJE WAM TERMIN RYWALA?</div>
        ${['primary', 'backup'].filter(w => op[w]).map(w => `<button onclick="acceptTerm('${k}','${w}')" class="btn btn-primary" style="width:100%;font-size:.7rem;padding:.25rem .3rem;margin-bottom:.2rem">✅ Akceptuj ${w === 'primary' ? '⭐' : '↺'} ${_ssPickLabel(ws, op[w])}${op[w + 'From'] ? ' ' + op[w + 'From'] : ''}</button>`).join('')}
        <div style="font-size:.6rem;color:var(--muted)">Akceptacja od razu ustala termin — bez czekania na admina.</div>
      </div>` : '';
      return head + acc + (typeof assist !== 'undefined' ? assist : '') + _ssPicker(ctx, s, side) + av;
    }
    return head + (pk ? chip(pk.primary, 'primary', pk) + chip(pk.backup, 'backup', pk) : `<span style="font-size:.72rem;color:var(--muted)">— czeka na wybór —</span>`) + av;
  };

  let suggestHtml = '';
  if(!isFinal) {
    const sg = _ssSuggest(p, ws);
    const msg = !sg
      ? (p.team1 || p.team2 ? `⏳ Czeka na: ${_h(p.team1 ? s.team2 : s.team1)}` : '')
      : sg.kind === 'none' ? `⚠ Brak wspólnego dnia — termin ustala admin`
      : (sg.kind === 'match' ? '✨ Oba priorytety zgodne: ' : sg.kind === 'partial' ? '👍 Wspólny dzień: ' : '↺ Zgodne tylko dni zapasowe: ') +
        `<b>${_ssPickLabel(ws, sg.day)}</b>` +
        (sg.overlap ? ` · wspólne okno <b>${_tw(sg.overlap.f, sg.overlap.t)}</b>`
          : sg.wa && sg.wb ? ` · <span style="color:var(--loss)">godziny się nie pokrywają (${_tw(sg.wa.f, sg.wa.t)} vs ${_tw(sg.wb.f, sg.wb.t)})</span>` : '');
    if(msg) suggestHtml = `<div style="font-size:.75rem;margin-top:.5rem;color:${sg && sg.kind === 'none' ? 'var(--loss)' : 'var(--text)'}">${msg}</div>`;
  }

  return `
    <div style="margin-top:.75rem;padding-top:.65rem;border-top:1px solid var(--border)">
      <div style="font-size:.68rem;font-weight:700;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">📅 PROPOZYCJE TERMINU</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
        <div>${col('team1')}</div>
        <div>${col('team2')}</div>
      </div>
      ${suggestHtml}
    </div>`;
}

function _ssPicker(ctx, s, side) {
  const k = String(s.id);
  const saved = ctx.picks[k]?.[side] || {};
  const d = _ssDraft[k] || { primary: saved.primary || '', backup: saved.backup || '', primaryFrom: saved.primaryFrom || '', primaryTo: saved.primaryTo || '', backupFrom: saved.backupFrom || '', backupTo: saved.backupTo || '', open: {} };
  d.open = d.open || {};
  const keys = ['primary', 'backup', 'primaryFrom', 'primaryTo', 'backupFrom', 'backupTo'];
  const dirty = keys.some(x => (d[x] || '') !== (saved[x] || ''));
  const today = new Date().toISOString().slice(0, 10);
  const btnStyle = (on, disabled, kind) => `flex:1;font-size:.7rem;padding:.25rem 0;border-radius:5px;font-family:inherit;cursor:${disabled ? 'not-allowed' : 'pointer'};
    border:1px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? (kind === 'primary' ? 'var(--accent)' : 'rgba(245,197,24,.15)') : 'transparent'};
    color:${on ? (kind === 'primary' ? 'rgba(0,0,0,.88)' : 'var(--accent)') : disabled ? 'rgba(127,127,127,.35)' : 'var(--text)'}`;
  const sel = (kind, which) => `<select onchange="ssPickTime('${k}','${kind}','${which}',this.value)" style="flex:1;min-width:0;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:.15rem .2rem;font-family:inherit;font-size:.7rem">
      <option value="">—</option>${TW_OPTS.map(o => `<option ${d[kind + which] === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
  const row = (kind, label) => {
    const custom = d.open[kind] || _ssIsCustom(d[kind]);
    const other = kind === 'backup' ? d.primary : '';
    const f = d[kind + 'From'], t = d[kind + 'To'];
    const winBad = (f || t) && !_twValid(f, t);
    // ilu potwierdzonych graczy z mojej drużyny może w tym dniu i oknie
    let avail = '';
    if(!ctx.demo && d[kind] && _twValid(f, t)) {
      const ps = _teamPlayers(s[side], s.seasonId);
      if(ps.length) {
        const dow = _dowOfPick(s.weekStart, d[kind]);
        const ok = ps.filter(p => _availOn(p, s.week, dow) && (!p.hours?.[dow] || _twOverlap({ f, t }, { f: p.hours[dow][0], t: p.hours[dow][1] })));
        avail = `<div style="font-size:.62rem;color:var(--muted);margin-top:.12rem">👥 może grać: <b style="color:${ok.length >= 5 ? 'var(--win)' : 'var(--text)'}">${ok.length}</b> / ${ps.length}</div>`;
      }
    }
    return `
    <div style="font-size:.64rem;color:var(--muted);margin:.3rem 0 .15rem">${label}</div>
    <div style="display:flex;gap:.25rem">
      ${Object.keys(SS_DAYS).map(day => {
        const on = d[kind] === day && !custom;
        const disabled = kind === 'backup' && other === day;
        return `<button ${disabled ? 'disabled' : ''} onclick="ssPickDraft('${k}','${kind}','${day}')" title="${SS_DAYS[day].full}" style="${btnStyle(on, disabled, kind)}">${_ssDayChip(s.weekStart, day)}</button>`;
      }).join('')}
      <button onclick="ssPickDraft('${k}','${kind}','custom')" title="Inny termin uzgodniony z rywalem" style="${btnStyle(custom, false, kind)}">📅 Inny</button>
    </div>
    ${custom ? `
      <input type="date" id="ss-c-${k}-${kind}-d" min="${today}" value="${_ssIsCustom(d[kind]) ? d[kind].slice(0, 10) : ''}" oninput="ssPickCustomInput('${k}','${kind}',this)" onblur="ssPickCustom('${k}','${kind}')"
        style="width:100%;box-sizing:border-box;margin-top:.25rem;background:var(--bg);border:1px solid var(--accent);color:var(--text);border-radius:5px;padding:.2rem .3rem;font-family:inherit;font-size:.7rem">
      ${_ssIsCustom(d[kind]) && (d[kind].slice(0, 10) < s.weekStart || d[kind].slice(0, 10) > _ssAddDays(s.weekStart, 6))
        ? `<div style="font-size:.62rem;color:var(--accent);margin-top:.15rem">⚠ Poza tygodniem ${s.week} — upewnij się, że rywal się zgadza</div>` : ''}` : ''}
    <div style="display:flex;gap:.25rem;align-items:center;margin-top:.25rem;font-size:.66rem;color:var(--muted)">🕐 od ${sel(kind, 'From')} do ${sel(kind, 'To')}</div>
    ${winBad ? '<div style="font-size:.62rem;color:var(--loss);margin-top:.12rem">Okno ma mieć od 1 do 3 godzin</div>' : ''}
    ${avail}`;
  };
  const winsOk = _twValid(d.primaryFrom, d.primaryTo) && _twValid(d.backupFrom, d.backupTo);
  const canSave = d.primary && d.backup && d.primary !== d.backup && winsOk && dirty;
  const hint = d.primary && d.backup && !winsOk ? '<div style="font-size:.62rem;color:var(--muted);margin-top:.25rem">Podaj okno godzin (1–3 h) dla obu dni, np. 20:00–22:00</div>' : '';
  return row('primary', '⭐ Priorytet') + row('backup', '↺ Zapas') + hint + `
    <button onclick="ssSavePick('${k}')" ${canSave ? '' : 'disabled'} class="btn btn-primary" style="width:100%;margin-top:.4rem;font-size:.72rem;padding:.25rem 0;${canSave ? '' : 'opacity:.45'}">
      ${saved.primary && !dirty ? '✓ Zapisano' : '💾 Zapisz wybór'}</button>`;
}

function _ssAdminActions(ctx, s, res) {
  if(!ctx.isAdmin) return '';
  const k = String(s.id);
  const b = (onclick, label, style) => `<button onclick="${onclick}" class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .5rem;${style || ''}">${label}</button>`;
  const out = [];
  if(!res) {
    if(s.date) {
      out.push(b(`ssUnfinalize('${k}')`, '↩ Zmień termin'));
      if(!ctx.demo) out.push(b(`ssResendMatch('${k}')`, '📣 Wyślij na Discord'));
    }
    else {
      const p = ctx.picks[k] || {};
      const sg = _ssSuggest(p, s.weekStart);
      const customs = [...new Set(['team1', 'team2'].flatMap(sd => [p[sd]?.primary, p[sd]?.backup]).filter(_ssIsCustom))];
      [...Object.keys(SS_DAYS), ...customs].forEach(v => {
        const sug = sg && sg.day === v;
        const wa = _twWin(p.team1, v), wb = _twWin(p.team2, v), ov = _twOverlap(wa, wb);
        const tm = ov?.f || wa?.f || wb?.f || '';
        out.push(`<button onclick="ssFinalize('${k}','${v}','${tm}')" class="btn ${sug ? 'btn-primary' : 'btn-ghost'}" style="font-size:.7rem;padding:.2rem .5rem">✅ ${_ssPickLabel(s.weekStart, v)}${tm && !_ssPickTime(v) ? ' ' + tm : ''}</button>`);
      });
    }
  }
  if(ctx.demo) {
    if(!res?.done) out.push(b(`demoSimResult('${k}')`, '🎲 Symuluj ' + ((s.bestOf || 1) > 1 ? 'mecz' : 'wynik')));
    if(res) out.push(b(`demoSimResult('${k}', true)`, '↩ Cofnij wynik'));
  } else {
    out.push(b(`ssLinkGames('${k}')`, `🔗 Wyniki ${res ? res.games.length : 0}/${s.bestOf || 1}`));
    if(!res?.done) out.push(b(`ssWalkover('${k}')`, '🏳 Walkower'));
    out.push(b(`openScheduleEdit(${s.id})`, '✏️'));
  }
  return `<div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.65rem;padding-top:.55rem;border-top:1px dashed var(--border)">
    <span style="font-size:.64rem;color:var(--muted);align-self:center;margin-right:.2rem">👑 ${s.date || res ? 'ADMIN' : 'ZATWIERDŹ TERMIN'}</span>${out.join('')}</div>`;
}

function _scheduleDiscordSendR(){return __lz(3,'_scheduleDiscordSendR',this,arguments)}
function _scheduleDiscordSend(){return __lz(3,'_scheduleDiscordSend',this,arguments)}

function _ssLoadImg(){return __lz(3,'_ssLoadImg',this,arguments)}
function _ssLogoSrc(name) {
  return teamRegistrations.find(r => r.logo && r.status !== 'rejected' && String(r.teamName).toLowerCase() === String(name).toLowerCase())?.logo
    || (typeof teams !== 'undefined' && teams[name]?.logo) || null;
}
function _ssMatchBanner(){return __lz(3,'_ssMatchBanner',this,arguments)}

function _ssTeamSeasonStats(){return __lz(3,'_ssTeamSeasonStats',this,arguments)}

function _ssMatchAiData(){return __lz(3,'_ssMatchAiData',this,arguments)}

function _ssMatchEmbed(){return __lz(3,'_ssMatchEmbed',this,arguments)}

function _ssAnnounceMatch(){return __lz(3,'_ssAnnounceMatch',this,arguments)}
function _emo(team) { const e = (window._emojiMap || {})[team]; return e ? e + ' ' : ''; }
function _ssAnnounceMatchInner(){return __lz(3,'_ssAnnounceMatchInner',this,arguments)}

function ssResendMatch(){return __lz(3,'ssResendMatch',this,arguments)}

function ssLinkGames(){return __lz(3,'ssLinkGames',this,arguments)}

function ssLinkLimit(){return __lz(3,'ssLinkLimit',this,arguments)}

function ssConfirmLinkGames(){return __lz(3,'ssConfirmLinkGames',this,arguments)}

function ssPickDraft(){return __lz(3,'ssPickDraft',this,arguments)}

function acceptTerm(){return __lz(3,'acceptTerm',this,arguments)}

function ssPickTime(){return __lz(3,'ssPickTime',this,arguments)}
function _ssMySide(){return __lz(3,'_ssMySide',this,arguments)}

function ssPickCustomInput(){return __lz(3,'ssPickCustomInput',this,arguments)}
function ssPickCustom(){return __lz(3,'ssPickCustom',this,arguments)}

function ssSavePick(){return __lz(3,'ssSavePick',this,arguments)}

function ssFinalize(){return __lz(3,'ssFinalize',this,arguments)}

function ssUnfinalize(){return __lz(3,'ssUnfinalize',this,arguments)}

function openFixtureGenerator(){return __lz(3,'openFixtureGenerator',this,arguments)}

function _ssGenSet(){return __lz(3,'_ssGenSet',this,arguments)}

function _ssGenRender(){return __lz(3,'_ssGenRender',this,arguments)}

function ssDrawGroups(){return __lz(3,'ssDrawGroups',this,arguments)}

function ssConfirmFixture(){return __lz(3,'ssConfirmFixture',this,arguments)}

function startDemo(){return __lz(3,'startDemo',this,arguments)}

function _demoGame(){return __lz(3,'_demoGame',this,arguments)}

function _demoSeed(){return __lz(3,'_demoSeed',this,arguments)}

function demoSetRole(){return __lz(3,'demoSetRole',this,arguments)}
function demoSetCaptain(){return __lz(3,'demoSetCaptain',this,arguments)}
function demoVote(){return __lz(3,'demoVote',this,arguments)}
function demoSimResult(){return __lz(3,'demoSimResult',this,arguments)}
function endDemo(){return __lz(3,'endDemo',this,arguments)}

// ═══ Linki bezpośrednie: #terminarz, #terminarz-week-3, #zapisy, #wolni-agenci ═══
function openDeepLink() {
  setTimeout(() => { window._routeHandled = true; }, 3000); // potem przejścia na inne widoki czyszczą adres z linku
  const _q = new URLSearchParams(location.search).get('v') || '';
  const _p = location.protocol === 'file:' ? '' : location.pathname.replace(/^\/+|\/+$/g, '').replace(/(^|\/)index\.html$/, ''); // ładne adresy: /rules, /register
  const h = decodeURIComponent((location.hash || '').replace(/^#/, '') || _q || _p).toLowerCase();
  const _vv = _viewOfSlug(h); // 🔗 adres zakładki (np. /eventy, /terminarz) — zostaje w pasku adresu
  if(_p && !location.hash && !_q && !_vv) try { history.replaceState(history.state, '', '/' + location.search); } catch(e) {} // inne linki: po otwarciu adres wraca na stronę główną
  if(!h) return;
  if(_vv) { setTimeout(() => showView(_vv), 300); return; }
  if(['wymiany', 'trades', 'wymiana'].includes(h)) { setTimeout(() => { showView('cards'); setTimeout(() => document.getElementById('trades-sec')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 1500); }, 300); return; }
  if(['wrapped', 'moj-wrapped', 'mój-wrapped'].includes(h)) { setTimeout(() => { if(discordUser) { _wr.tab = null; openWrapped(); } else showToast('Zaloguj się przez Discord, żeby zobaczyć swój Wrapped', 'info'); }, 900); return; }
  if(['fantasy-plus', 'fantasyplus', 'fplus', 'fantasy+'].includes(h)) { setTimeout(() => showView('fplus'), 300); return; }
  if(['gm-demo', 'demo-gm', 'liga-gm-demo', 'gmdemo'].includes(h)) { window._gmdAuto = true; setTimeout(() => showView('fplus'), 300); return; }
  if(/^duel-[a-z0-9]{6}$/.test(h)) { _kortLiveCode = h.slice(5); _kortTab = 'live'; setTimeout(() => showView('kort'), 300); return; }
  const flash = el => {
    if(!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.style.transition = 'box-shadow .3s';
    el.style.boxShadow = '0 0 0 2px var(--accent)';
    el.style.borderRadius = '12px';
    setTimeout(() => { el.style.boxShadow = ''; }, 1600);
  };
  const m = h.match(/^(terminarz|harmonogram)(?:-week-?(\d+))?$/);
  if(m) {
    showView('schedule');
    if(m[2]) _ssWeek = Number(m[2]);
    renderSchedule();
    setTimeout(() => flash(document.getElementById('season-schedule-wrap')), 150);
    return;
  }
  if(h === 'kronika') { showView('dashboard'); setTimeout(openChronicle, 300); return; }
  if(h === 'panel' || h === 'moj-panel') { showView('mypanel'); return; }
  if(h === 'fantasy') { showView('fantasy'); return; }
  if(h === 'druzyny' || h === 'teams') { showView('teams'); return; }
  if(h === 'multistream') { openMultistream(); return; }
  if(h === 'podcast') { showView('podcast'); return; }
  if(h.startsWith('akcje/') || h.startsWith('highlights/')) { const id = decodeURIComponent(h.split('/')[1] || ''); showView('schedule'); // 🎬 link do akcji konkretnego meczu (z ogłoszenia bota)
    let n = 0; const t = setInterval(() => { if(_ssItem(id) || ++n > 40) { clearInterval(t); if(_ssItem(id)) openClips(id); } }, 250); return; }
  if(h.startsWith('podcast/')) { window._podFocusId = decodeURIComponent(h.slice(8)); showView('podcast'); return; }
  if(h.startsWith('gracz/')) { const n = decodeURIComponent(h.slice(6)); setTimeout(() => { try { const pl = _withAllMatches(() => matches.slice()).flatMap(m => [m.team1, m.team2]).flatMap(t => (t.players || []).map(p => ({ p, t: t.name }))).find(x => _normNick(x.p.name) === _normNick(n)); openPlayerModal(pl?.p.name || n, pl?.t || ''); } catch(e) {} }, 400); return; }
  if(h.startsWith('druzyna/')) { const n = decodeURIComponent(h.slice(8)); setTimeout(() => { try { openTeamModal(n); } catch(e) {} }, 400); return; }
  if(h === '2kordle' || h === 'kordle') { showView('kordle'); return; }
  if(h === 'kibice' || h === 'liga-kibicow') { setTimeout(() => showView('fans'), 0); return; }
  if(h.startsWith('mecz/') || h.startsWith('match/')) { const id = decodeURIComponent(h.split('/')[1] || ''); showView('schedule'); let n = 0; const t = setInterval(() => { if(_ssItem(id) || ++n > 40) { clearInterval(t); if(_ssItem(id)) openMatchCenter(id); } }, 250); return; }
  if(h.startsWith('wywiad/') || h.startsWith('interview/')) { const id = decodeURIComponent(h.split('/')[1] || ''); setTimeout(() => openInterview(id), 1200); return; }
  if(['media-day', 'poznaj-druzyny', 'meet-the-teams'].includes(h)) { setTimeout(() => openMediaGallery(), 1500); return; }
  if(['polaczone-konta', 'linked-accounts'].includes(h)) { setTimeout(() => openLinkedAccounts(), 1500); return; }
  if(['pay', 'platnosc', 'wpisowe', 'entry-fee'].includes(h)) { openMyPayment(); return; }
  if(['start-ligi', 'launch'].includes(h)) { setTimeout(() => openLaunch(), 1500); return; }
  if(['dywizje', 'divisions'].includes(h)) { setTimeout(() => openDivisions(), 1500); return; }
  if(['do-zrobienia', 'admin-todo', 'todo'].includes(h)) { setTimeout(() => openAdminQuick(), 1500); return; }
  if(['turniej', 'turniej-kortu', 'tournament'].includes(h)) { setTimeout(() => showView('kort'), 300); return; }
  if(['galeria-slaw', 'galeria', 'hall-of-fame', 'hof'].includes(h)) { setTimeout(() => { showView('awards'); setTimeout(() => document.getElementById('hof-sec')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 900); }, 300); return; }
  if(['przepustka', 'season-pass', 'pass'].includes(h)) { setTimeout(() => { showView('fans'); setTimeout(() => document.getElementById('pass-sec')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 2200); }, 300); return; }
  if(h === 'liga-gm' || h === 'gm') { setTimeout(() => { if(_gmVisible()) showView('gm'); }, 0); return; }
  if(h === 'kolejka-x') { setTimeout(() => openXQueue(), 600); return; }
  if(h === 'kolekcja' || h === 'karty') { setTimeout(() => showView('cards'), 0); return; }
  if(h === 'rules' || h === 'regulamin') { setTimeout(() => showView('rules'), 0); return; }
  if(['register', 'rejestracja', 'zapisy', 'signup', 'join'].includes(h)) { setTimeout(() => _openRegisterLink(), 300); return; }
  if(['fa', 'free-agent', 'freeagent', 'wolny-agent', 'wolni-agenci'].includes(h)) { setTimeout(() => _openFaLink(), 300); return; }
  if(h.startsWith('kibic/')) { const id = h.split('/')[1]; setTimeout(() => openFanProfile(id), 800); return; }
  if(h.startsWith('rywalizacja/')) { const [a, b] = decodeURIComponent(h.slice(12)).split('~'); setTimeout(() => { const T = n => [...new Set(_withAllMatches(() => matches.flatMap(m => [m.team1.name, m.team2.name])))].find(x => x.toLowerCase() === n) || n; if(a && b) openRivalry(T(a), T(b)); }, 1200); return; }
  if(h.startsWith('event/') || h.startsWith('draft/')) { const id = decodeURIComponent(h.split('/').slice(1).join('/')); setTimeout(() => { showView('events'); setTimeout(() => { if(events.some(e => e.id === id)) openEventDetail(id); else showToast(_g('Nie znaleziono tego draftu', 'Draft not found'), 'info'); }, 400); }, 0); return; }
  if(h === 'draft-night') { setTimeout(() => startDraftNightOverlay(), 800); return; }
  if(h === 'admin') { if(!_isLoggedInSync()) document.getElementById('auth-modal')?.classList.add('open'); return; }
  if(h === 'eventy-admin') { localStorage.setItem('nba2k_show_events_login', '1'); updateEventsAuthUI(); if(!_isEventsAdminSync() && !_isLoggedInSync()) document.getElementById('events-auth-modal')?.classList.add('open'); return; }
  if(h === 'zapisy' || h === 'wolni-agenci' || h === 'transfery') {
    _regTab = h === 'zapisy' ? 'teams' : h === 'transfery' ? 'tr' : 'fa';
    showView('dashboard');
    renderTeamRegistrations();
    setTimeout(() => flash(document.getElementById('team-registrations-wrap')), 150);
  }
}

function copyDeepLink(){return __lz(3,'copyDeepLink',this,arguments)}

function _poHistoryHtml(){return __lz(3,'_poHistoryHtml',this,arguments)}

function openChampionsHistory(){return __lz(3,'openChampionsHistory',this,arguments)}

function _knownDiscordUsers(){return __lz(4,'_knownDiscordUsers',this,arguments)}

function openCaptainChange(){return __lz(4,'openCaptainChange',this,arguments)}

function saveCaptainChange(){return __lz(4,'saveCaptainChange',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// NOWOŚCI: typer, nagrody tygodnia, power ranking, transfery, podsumowanie
// tygodnia, przypomnienia, rekordy, kalendarz, wyniki od kapitanów, profile
// ═══════════════════════════════════════════════════════════════
const _MODAL_INP = 'background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.5rem .7rem;font-family:inherit;font-size:.85rem;width:100%;box-sizing:border-box';
const _MODAL_LBL = 'display:block;font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.35rem';

function _fxModal(id, maxW) {
  let m = document.getElementById(id);
  if(!m) {
    m = document.createElement('div');
    m.id = id;
    m.className = 'modal-overlay';
    m.style.zIndex = '1250';
    m.onclick = e => { if(e.target === m) m.classList.remove('open'); };
    m.innerHTML = `<div class="modal" style="max-width:${maxW || 620}px"></div>`;
    document.body.appendChild(m);
  }
  return m;
}
function _fxClose(){return __lz(4,'_fxClose',this,arguments)}
function _fxHead(id, title) {
  return `<button class="modal-close" onclick="_fxClose('${id}')">&#x2715;</button>
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.45rem;letter-spacing:1px;margin-bottom:1rem">${title}</div>`;
}
function _seasonKey(sid) { return sid || '_'; }
function _seasonName(sid) { return seasons.find(x => x.id === sid)?.name || ''; }
function _seasonMatchesOf(sid) { return _withAllMatches(() => matches.filter(m => !sid || m.seasonId === sid)); }
function _trunc(){return __lz(4,'_trunc',this,arguments)}
function _avatarHtml(url, size) {
  return url ? `<img src="${_h(url)}" alt="" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0">`
             : `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:${size * .5}px;flex-shrink:0">👤</div>`;
}
// Mecze (gry) przypięte do pozycji terminarza
function _itemGames(s) {
  return _withAllMatches(() => _ssMatchIds(s).map(id => matches.find(m => Number(m.id) === Number(id))).filter(Boolean));
}
// Bilans drużyn w sezonie (W/L z pojedynczych meczów)
function _seasonTable(sid) {
  const t = {};
  const add = n => (t[n] = t[n] || { team: n, w: 0, l: 0, pf: 0, pa: 0, form: [] });
  const fx = seasons.find(x => x.id === sid)?.fixture;
  (fx?.groups?.length ? fx.groups.flatMap(g => g.teams) : schedule.filter(s => s.generated && s.seasonId === sid).flatMap(s => [s.team1, s.team2])).forEach(add);
  _seasonMatchesOf(sid).filter(m => !_isAnyPlayoffMatch(m)).sort((a, b) => String(a.date).localeCompare(String(b.date))).forEach(m => {
    const a = add(m.team1.name), b = add(m.team2.name);
    const w1 = m.team1.score > m.team2.score;
    a.pf += m.team1.score || 0; a.pa += m.team2.score || 0; b.pf += m.team2.score || 0; b.pa += m.team1.score || 0;
    w1 ? (a.w++, b.l++) : (b.w++, a.l++);
    a.form.push(w1 ? 'W' : 'L'); b.form.push(w1 ? 'L' : 'W');
  });
  return Object.values(t).map(x => ({ ...x, gp: x.w + x.l, diff: x.pf - x.pa, form5: x.form.slice(-5).join('') }))
    .sort((a, b) => (b.w - a.w) || (b.diff - a.diff) || a.team.localeCompare(b.team));
}

// ═══ 🎯 TYPER ═══════════════════════════════════════════════════
function _typerHtml(ctx) {
  if(ctx.demo) return '';
  const td = typerData[_seasonKey(ctx.seasonId)];
  const overall = td?.overall || [];
  const weekList = td?.weeks?.[_ssWeek] || [];
  const me = discordUser?.id;
  const myIdx = overall.findIndex(x => x.id === me);
  const row = (x, i, hl) => `
    <div style="display:grid;grid-template-columns:28px 26px 1fr auto auto;align-items:center;gap:.55rem;padding:.4rem .7rem;border-bottom:1px solid var(--border);${hl ? 'background:rgba(245,197,24,.08)' : ''}">
      <b style="font-family:'Barlow Condensed',sans-serif;font-size:1rem;color:${i < 3 ? 'var(--accent)' : 'var(--muted)'}">${['🥇', '🥈', '🥉'][i] || i + 1}</b>
      ${_avatarHtml(x.avatar, 24)}
      <span style="font-size:.84rem;font-weight:${hl ? 800 : 600};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(x.name)}${hl ? ' (Ty)' : ''}</span>
      <span style="font-size:.7rem;color:var(--muted)">${x.acc}% · ${x.picks} typ.</span>
      <b style="font-family:'Barlow Condensed',sans-serif;font-size:1.05rem;color:var(--accent);min-width:34px;text-align:right">${x.pts}</b>
    </div>`;
  const top = overall.slice(0, 10).map((x, i) => row(x, i, x.id === me)).join('');
  const mine = myIdx >= 10 ? `<div style="text-align:center;color:var(--muted);font-size:.7rem;padding:.15rem">⋯</div>` + row(overall[myIdx], myIdx, true) : '';
  const wk = weekList.slice(0, 3).map((x, i) => row(x, i, x.id === me)).join('');
  return `
    <div style="margin-top:1.5rem">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.05rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted)">🎯 Typer sezonu</div>
        <div style="font-size:.7rem;color:var(--muted)">1 pkt za trafiony wynik spotkania · przy Bo2 możesz typować też remis 1:1 (🤝) · typujesz przyciskiem 👍 przy meczu</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:.75rem">
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">
          <div style="padding:.5rem .7rem;font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);border-bottom:1px solid var(--border)">KLASYFIKACJA GENERALNA</div>
          ${top + mine || '<div style="padding:1rem;text-align:center;color:var(--muted);font-size:.82rem">Ranking pojawi się po pierwszych rozegranych meczach z typami</div>'}
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">
          <div style="padding:.5rem .7rem;font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);border-bottom:1px solid var(--border)">TYPER TYGODNIA — WEEK ${_ssWeek || '?'}</div>
          ${wk || '<div style="padding:1rem;text-align:center;color:var(--muted);font-size:.82rem">Brak rozstrzygniętych typów w tym tygodniu</div>'}
        </div>
      </div>
    </div>`;
}

// ═══ 🛠 NARZĘDZIA TYGODNIA (admin) + 📆 kalendarz ══════════════════
function _ssToolsHtml(ctx) {
  if(ctx.demo || !ctx.items.length) return '';
  const b = (onclick, label, title) => `<button onclick="${onclick}" class="btn btn-ghost" title="${title || ''}" style="font-size:.74rem;padding:.3rem .65rem">${label}</button>`;
  const admin = ctx.isAdmin ? `
    <span style="font-size:.66rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-right:.15rem">👑 WEEK ${_ssWeek}:</span>
    ${b('ssRemindCaptains()', '🔔 Przypomnij kapitanom', 'Wiadomość prywatna do kapitanów, którzy nie wybrali terminu')}
    ${b('openWeekSummary()', '📰 Podsumowanie', 'Podsumowanie tygodnia na Discord')}
    ${b('openAwardsCreate()', '🏅 Nagrody tygodnia', 'Głosowanie kibiców na nagrody tygodnia')}
    ${b('openPowerRankingCreate()', '📊 Power Ranking')}
    ${b('runWeekPack()', '⚡ Pakiet tygodnia', 'Przypomnienia + podsumowanie + Power Ranking + nagrody jednym kliknięciem')}
    ${b('openGalaCreate()', '🏆 Gala sezonu', 'Głosowanie na nagrody całego sezonu')}` : '';
  return `<div style="display:flex;gap:.35rem;flex-wrap:wrap;align-items:center;margin:-.25rem 0 .85rem">
    ${admin}
    <span style="flex:1"></span>
    ${b('openCalendarModal()', '📆 Kalendarz', 'Mecze w Twoim kalendarzu')}
  </div>`;
}

function ssRemindCaptains(){return __lz(4,'ssRemindCaptains',this,arguments)}

// ═══ 📸 WYNIKI ZGŁASZANE PRZEZ KAPITANÓW ═════════════════════════
function _ssResultsBlock(ctx, s) {
  if(ctx.demo) return '';
  const k = String(s.id);
  const res = _ssResult(ctx, s);
  const pend = pendingResults.filter(p => String(p.scheduleId) === k);
  const mySide = ctx.myTeam ? ['team1', 'team2'].find(sd => String(s[sd]).toLowerCase() === ctx.myTeam.toLowerCase()) : null;
  const linked = res ? res.games.length : 0;
  const canReport = (mySide || ctx.isAdmin) && linked + pend.length < (s.bestOf || 1);
  if(!pend.length && !canReport) return '';
  const rows = pend.map(p => {
    const md = p.matchData;
    const mine = p.side === mySide;
    const canDecide = ctx.isAdmin || (mySide && !mine);
    return `<div style="background:rgba(245,197,24,.07);border:1px dashed var(--accent);border-radius:8px;padding:.5rem .65rem;font-size:.78rem;margin-top:.4rem">
      ⏳ <b>Do potwierdzenia:</b> ${_h(md.team1.name)} <b>${md.team1.score}:${md.team2.score}</b> ${_h(md.team2.name)}
      <div style="font-size:.68rem;color:var(--muted);margin:.15rem 0 .35rem">zgłosił ${_h(p.by?.name || '?')} · ${mine ? 'czeka na potwierdzenie rywala' : canDecide ? 'sprawdź wynik' : 'czeka na kapitana rywala'}</div>
      ${(md.qualityFlags || []).length ? `<div style="font-size:.68rem;color:#f59e0b;margin:-.15rem 0 .35rem;line-height:1.45">${md.qualityFlags.map(f => '⚠️ ' + _h(f)).join('<br>')}</div>` : ''}
      <div style="display:flex;gap:.3rem;flex-wrap:wrap">
        ${canDecide ? `<button onclick="ssDecideResult('${p.id}',true)" class="btn btn-primary" style="font-size:.7rem;padding:.2rem .55rem">✅ Potwierdź</button>` : ''}
        ${canDecide || mine ? `<button onclick="ssDecideResult('${p.id}',false)" class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .55rem">${mine && !ctx.isAdmin ? '↩ Wycofaj' : '❌ Odrzuć'}</button>` : ''}
      </div>
    </div>`;
  }).join('');
  return `<div style="margin-top:.65rem">${rows}
    ${canReport ? `<button onclick="openReportResult('${k}')" class="btn btn-ghost" style="width:100%;margin-top:.45rem;font-size:.74rem;padding:.3rem 0">📸 ${mySide ? 'Zgłoś wynik' : 'Dodaj wynik ze screena'}${(s.bestOf || 1) > 1 ? ` (mecz ${linked + pend.length + 1}/${s.bestOf})` : ''}</button>` : ''}
  </div>`;
}

function _reportAsAdmin(){return __lz(4,'_reportAsAdmin',this,arguments)}
function openReportResult(){return __lz(4,'openReportResult',this,arguments)}

let _reportImage2 = null;
function _reportPreview2(){return __lz(4,'_reportPreview2',this,arguments)}
let _reportImage = null;
function _reportPreview(){return __lz(4,'_reportPreview',this,arguments)}

function sendReportResult(){return __lz(4,'sendReportResult',this,arguments)}

function _announceResult(){return __lz(4,'_announceResult',this,arguments)}
function _announceResultInner(){return __lz(4,'_announceResultInner',this,arguments)}

function _capOf(){return __lz(4,'_capOf',this,arguments)}
function _agoPL(iso) {
  const m = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if(m < 60) return `${m} min`;
  const h = Math.round(m / 60); if(h < 48) return `${h} h`;
  return `${Math.round(h / 24)} dni`;
}
function openPendingResults(){return __lz(4,'openPendingResults',this,arguments)}
function pendingNudge(){return __lz(4,'pendingNudge',this,arguments)}

function ssDecideResult(){return __lz(4,'ssDecideResult',this,arguments)}

function _calTeamUrl(){return __lz(4,'_calTeamUrl',this,arguments)}
function openCalendarModal(){return __lz(4,'openCalendarModal',this,arguments)}

function ssCalendarSingle(){return __lz(4,'ssCalendarSingle',this,arguments)}

function _downloadIcs(){return __lz(4,'_downloadIcs',this,arguments)}

// ═══ 📰 PODSUMOWANIE TYGODNIA ════════════════════════════════════
function _weekData(sid, week) {
  const items = schedule.filter(s => s.generated && (s.seasonId || null) === (sid || null) && s.week === week);
  const ctx = { demo: false };
  const results = items.map(s => ({ s, res: _ssResult(ctx, s) })).filter(x => x.res);
  const games = items.flatMap(_itemGames);
  const pl = {};
  games.forEach(m => [m.team1, m.team2].forEach(t => (t.players || []).forEach(p => {
    const x = pl[p.name + '|' + t.name] = pl[p.name + '|' + t.name] || { name: p.name, team: t.name, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, gp: 0 };
    x.pts += p.pts || 0; x.reb += p.reb || 0; x.ast += p.ast || 0; x.stl += p.stl || 0; x.blk += p.blk || 0; x.to += p.to || p.tov || 0; x.gp++;
  })));
  return { items, results, games, players: Object.values(pl) };
}

function openWeekSummary(){return __lz(4,'openWeekSummary',this,arguments)}

function sendWeekSummary(){return __lz(4,'sendWeekSummary',this,arguments)}

// ═══ 🏅 NAGRODY TYGODNIA ═════════════════════════════════════════
function _awardCandidates(sid, week) {
  const wd = _weekData(sid, week);
  const fmtLine = p => `${+p.pts || 0} PTS · ${+p.reb || 0} REB · ${+p.ast || 0} AST${p.gp > 1 ? ` (${p.gp} mecze)` : ''}`;
  // ta sama miara co Piątka tygodnia i MVP meczu: średnia ocena występu na mecz (game score)
  const eff = p => ((+p.pts || 0) + 0.4 * (+p.fgm || 0) - 0.7 * (+p.fga || 0) + 0.4 * (+p.reb || 0) + 0.7 * (+p.ast || 0) + (+p.stl || 0) + (+p.blk || 0) - (+p.to || 0)) / Math.max(1, p.gp || 1);
  const cats = [];
  const mvp = [...wd.players].sort((a, b) => eff(b) - eff(a)).slice(0, 3);
  if(mvp.length >= 2) cats.push({ key: 'mvp', emoji: '⭐', title: 'MVP tygodnia', candidates: mvp.map(p => ({ id: p.name + '|' + p.team, label: p.name, team: p.team, sub: `${p.team} · ${fmtLine(p)}` })) });
  const def = [...wd.players].filter(p => p.stl + p.blk > 0).sort((a, b) => (b.stl + b.blk) - (a.stl + a.blk)).slice(0, 3);
  if(def.length >= 2) cats.push({ key: 'def', emoji: '🛡️', title: 'Obrońca tygodnia', candidates: def.map(p => ({ id: p.name + '|' + p.team, label: p.name, team: p.team, sub: `${p.team} · ${p.stl} STL · ${p.blk} BLK` })) });
  const close = [...wd.games].map(m => ({ m, d: Math.abs((m.team1.score || 0) - (m.team2.score || 0)) })).sort((a, b) => a.d - b.d).slice(0, 3);
  if(close.length >= 2) cats.push({ key: 'game', emoji: '🔥', title: 'Mecz tygodnia', candidates: close.map(({ m, d }) => ({ id: 'm' + m.id, label: `${m.team1.name} ${m.team1.score}:${m.team2.score} ${m.team2.name}`, sub: `różnica ${d} pkt` })) });
  const ups = wd.results.filter(x => x.res.done && x.res.winnerSide).map(({ s, res }) => {
    const c = scheduleVoteCounts[String(s.id)] || {}; const tot = (c.team1 || 0) + (c.team2 || 0);
    const loser = res.winnerSide === 'team1' ? 'team2' : 'team1';
    const share = tot ? Math.round((c[loser] || 0) / tot * 100) : 0;
    return { s, res, share, winner: s[res.winnerSide], loserName: s[loser], tot };
  }).filter(x => x.tot >= 2 && x.share > 50).sort((a, b) => b.share - a.share).slice(0, 3);
  const wClips = clipsList.filter(c => (c.seasonId || null) === (sid || null) && Number(c.week) === Number(week)).sort((a, b) => b.likes - a.likes).slice(0, 3);
  if(wClips.length >= 2) cats.push({ key: 'clip', emoji: '🎬', title: 'Akcja tygodnia', candidates: wClips.map(c => ({ id: 'c' + c.id, label: c.title || 'Akcja', sub: `${(c.teams || []).join(' vs ')} · ❤️ ${c.likes}` })) });
  if(ups.length >= 2) cats.push({ key: 'upset', emoji: '😮', title: 'Niespodzianka tygodnia', candidates: ups.map(x => ({ id: 's' + x.s.id, label: `${x.winner} pokonali ${x.loserName}`, sub: `${x.share}% kibiców typowało ${x.loserName}` })) });
  return cats;
}

function openAwardsCreate(){return __lz(4,'openAwardsCreate',this,arguments)}

function createAwards(){return __lz(4,'createAwards',this,arguments)}

// 🏅 nagrody: kategorie i tytuły zapisane po polsku → wyświetlanie w języku strony
const _AW_EN = { mvp: 'MVP of the week', def: 'Defender of the week', game: 'Game of the week', clip: 'Play of the week', upset: 'Upset of the week' };
function _awCat(c) { return currentLang === 'en' ? (_AW_EN[c?.key] || String(c?.title || '').replace(/ tygodnia$/i, ' of the week')) : (c?.title || ''); }
function _awTitle(t) { t = String(t || ''); return currentLang === 'en' ? t.replace(/^Nagrody\s*/i, 'Awards · ').replace(/\btygodnia\b/gi, 'of the week').replace(/\bsezonu\b/gi, 'of the season') : t; }
function renderAwardsDashboard() {
  const el = document.getElementById('awards-dashboard-wrap');
  if(!el) return;
  const isAdmin = _isLoggedInSync();
  const sid = currentSeasonId || null;
  awardsList = awardsList.filter(Boolean);
  const open = awardsList.filter(a => a.status === 'open' && (!sid || !a.seasonId || a.seasonId === sid));
  const lastClosed = [...awardsList].filter(a => a.status === 'closed' && (!sid || !a.seasonId || a.seasonId === sid)).sort((a, b) => String(b.closedAt).localeCompare(String(a.closedAt)))[0];
  const card = a => {
    const mine = myAwardVotes[a.id] || {};
    return `<div style="background:linear-gradient(135deg,rgba(245,197,24,.10),rgba(245,197,24,.02));border:1px solid rgba(245,197,24,.4);border-radius:12px;padding:.9rem 1rem;margin-bottom:.75rem">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem">
        <div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.25rem;letter-spacing:1px">🗳 ${_h(_awTitle(a.title))}</div>
          ${a.type === 'season' ? '<div style="font-size:.7rem;color:var(--muted)">Głos kapitana drużyny liczy się podwójnie</div>' : ''}
          ${a.endsAt ? `<div class="aw-cd" data-until="${_h(a.endsAt)}" style="font-size:.78rem;font-weight:700;color:var(--accent);margin-top:.15rem">${_awCdText(a.endsAt)}</div>` : ''}</div>
        ${isAdmin ? `<div style="display:flex;gap:.3rem"><button onclick="closeAwards('${a.id}')" class="btn btn-ghost" style="font-size:.72rem;padding:.25rem .6rem" title="Głosowanie i tak zamknie się samo po 3 dniach">🔒 Zakończ teraz</button>
          <button onclick="removeAwards('${a.id}')" class="btn btn-ghost" style="font-size:.72rem;padding:.25rem .5rem">🗑</button></div>` : ''}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:.6rem">
        ${a.categories.map(c => {
          const cnt = a.counts?.[c.key] || {}; const tot = Object.values(cnt).reduce((x, y) => x + y, 0);
          const reveal = !!mine[c.key] || isAdmin;
          return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:.55rem .65rem">
            <div style="font-weight:800;font-size:.85rem;margin-bottom:.4rem">${c.emoji || ''} ${_h(_awCat(c))}</div>
            ${c.candidates.map((x, xi) => {
              const on = mine[c.key] === x.id; const pct = tot ? Math.round((cnt[x.id] || 0) / tot * 100) : 0;
              return `<button onclick="voteAward('${a.id}','${c.key}',${xi})" style="position:relative;overflow:hidden;width:100%;text-align:left;margin-bottom:.3rem;padding:.4rem .55rem;border-radius:7px;cursor:pointer;font-family:inherit;
                border:1px solid ${on ? 'var(--accent)' : 'var(--border)'};background:var(--bg);color:var(--text)">
                ${reveal ? `<span style="position:absolute;left:0;top:0;bottom:0;width:${pct}%;background:rgba(245,197,24,.14)"></span>` : ''}
                <span style="position:relative;display:flex;justify-content:space-between;gap:.4rem">
                  <span><b style="font-size:.8rem">${on ? '✅ ' : ''}${_h(x.label)}</b><br><span style="font-size:.68rem;color:var(--muted)">${_h(x.sub || '')}</span></span>
                  ${reveal ? `<b style="font-size:.78rem;color:var(--accent);align-self:center">${pct}%</b>` : ''}
                </span>
              </button>`;
            }).join('')}
            <div style="font-size:.66rem;color:var(--muted);text-align:right">${tot} ${_plVotes(tot)}${!mine[c.key] && !isAdmin ? ' · zagłosuj, aby zobaczyć wyniki' : ''}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  };
  const winners = lastClosed && lastClosed.winners ? `<div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.55rem .8rem;margin-bottom:.75rem;font-size:.8rem">
      <b>🏅 ${_h(lastClosed.title)}:</b>
      ${lastClosed.categories.map(c => lastClosed.winners[c.key] ? `<span>${c.emoji || ''} ${_h(_awCat(c))}: <b style="color:var(--accent)">${_h(lastClosed.winners[c.key].label)}</b></span>` : '').join('<span style="color:var(--muted)">·</span>')}
      ${_isLoggedInSync() ? `<span style="flex:1"></span><button onclick="announceAwards('${lastClosed.id}')" class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .55rem" title="Wyślij ogłoszenie zwycięzców ponownie">📣 Ogłoś zwycięzców</button>` : ''}
    </div>` : '';
  el.innerHTML = open.map(card).join('') + (open.length ? '' : winners);
  try { el.style.display = (awardsList || []).some(a => a.status === 'open' && (!sid || !a.seasonId || a.seasonId === sid)) ? '' : 'none'; } catch(e) {} // na Dashboardzie tylko trwające głosowanie (zwycięzcy są w Ogłoszeniach)
  try { if(document.querySelector('.view.active')?.id === 'view-awards') renderAwardsView(); } catch(e) {}
  try { if(EU_MODE) renderEuDash(); else renderDashNews(); } catch(e) {}
}

function voteAward(){return __lz(4,'voteAward',this,arguments)}

function removeAwards(){return __lz(4,'removeAwards',this,arguments)}

function closeAwards(){return __lz(4,'closeAwards',this,arguments)}
// ⏳ licznik do końca głosowania (zamyka się samo po 3 dniach)
function _awCdText(until) {
  const ms = Date.parse(until) - Date.now(), en = currentLang === 'en';
  if(ms <= 0) return en ? '⏳ Voting is closing — winners coming soon' : '⏳ Głosowanie się zamyka — zwycięzcy za chwilę';
  const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
  const left = d ? (en ? `${d} d ${h} h` : `${d} ${d === 1 ? 'dzień' : 'dni'} ${h} godz.`) : h ? (en ? `${h} h ${m} min` : `${h} godz. ${m} min`) : `${m} min`;
  const when = new Date(until).toLocaleString(en ? 'en-GB' : 'pl-PL', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  return en ? `⏳ Voting ends in ${left} (${when})` : `⏳ Koniec głosowania za ${left} (${when})`;
}
setInterval(() => document.querySelectorAll('.aw-cd').forEach(el => { el.textContent = _awCdText(el.dataset.until); }), 30000);
function announceAwards(){return __lz(4,'announceAwards',this,arguments)}

// ═══ 📊 POWER RANKING ════════════════════════════════════════════
function _latestPower(sid) {
  return [...(powerRankings || [])].filter(p => (p.seasonId || null) === (sid || null)).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
}

function renderPowerRanking() {
  const el = document.getElementById('power-ranking-wrap');
  if(!el) return;
  const isAdmin = _isLoggedInSync();
  const pr = _latestPower(currentSeasonId || null);
  if(!pr) {
    el.innerHTML = isAdmin && schedule.some(s => s.generated && s.seasonId === currentSeasonId)
      ? `<div style="text-align:right;margin:-.75rem 0 1.25rem"><button onclick="openPowerRankingCreate()" class="btn btn-ghost" style="font-size:.75rem;padding:.3rem .7rem">📊 Utwórz Power Ranking</button></div>` : '';
    return;
  }
  const arrow = e => !e.prev ? '<span style="color:var(--muted);font-size:.7rem">NOWI</span>'
    : e.prev > e.rank ? `<span style="color:var(--win);font-weight:800">▲${e.prev - e.rank}</span>`
    : e.prev < e.rank ? `<span style="color:var(--loss);font-weight:800">▼${e.rank - e.prev}</span>` : '<span style="color:var(--muted)">=</span>';
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem">
      <div class="section-title" style="margin-bottom:0;font-size:1.3rem">📊 Power Ranking — Week ${pr.week}</div>
      ${isAdmin ? `<div style="display:flex;gap:.3rem"><button onclick="openPowerRankingCreate()" class="btn btn-ghost" style="font-size:.72rem;padding:.25rem .6rem">🔄 Nowy</button>
        <button onclick="sendPowerRanking()" class="btn btn-ghost" style="font-size:.72rem;padding:.25rem .6rem">📣 Wyślij</button></div>` : ''}
    </div>
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:1.5rem">
      ${_prGroups(pr).map(([gname, list]) => (gname ? `<div style="padding:.45rem .9rem;background:var(--surface2);font-family:'Barlow Condensed',sans-serif;font-weight:900;letter-spacing:1px;color:var(--accent)">${_h(gname)}</div>` : '') + list.map(e => `<div style="display:grid;grid-template-columns:34px 42px 30px 1fr;align-items:center;gap:.6rem;padding:.5rem .9rem;border-bottom:1px solid var(--border)">
        <b style="font-family:'Barlow Condensed',sans-serif;font-size:1.35rem;color:${e.rank <= 3 ? 'var(--accent)' : 'var(--text)'}">${e.rank}</b>
        <div style="text-align:center;font-size:.8rem">${arrow(e)}</div>
        ${teamLogo(e.team, 28, '.65rem')}
        <div style="min-width:0">
          <div style="font-weight:800;font-size:.9rem">${_h(e.team)} <span style="font-weight:600;font-size:.72rem;color:var(--muted)">${e.w}-${e.l}${e.form ? ' · ' + e.form : ''}</span></div>
          <div style="font-size:.76rem;color:var(--muted);font-style:italic">${_h(e.line || '')}</div>
        </div>
      </div>`).join('')).join('')}
    </div>`;
}

function openPowerRankingCreate(){return __lz(4,'openPowerRankingCreate',this,arguments)}

function savePowerRanking(){return __lz(4,'savePowerRanking',this,arguments)}

function sendPowerRanking(){return __lz(4,'sendPowerRanking',this,arguments)}

function renderTransfers(){return __lz(4,'renderTransfers',this,arguments)}

function _knownPlayers(){return __lz(4,'_knownPlayers',this,arguments)}
function _knownTeams(){return __lz(4,'_knownTeams',this,arguments)}

function openTransferAdd(){return __lz(4,'openTransferAdd',this,arguments)}

function saveTransfer(){return __lz(4,'saveTransfer',this,arguments)}

function deleteTransfer(){return __lz(4,'deleteTransfer',this,arguments)}

// ═══ 🏛 REKORDY: wykrywanie pobitych rekordów ═══════════════════════
const _REC_KEYS = [
  { key: 'pts', label: 'Najwięcej punktów w meczu', emoji: '🔥', unit: 'PTS' },
  { key: 'reb', label: 'Najwięcej zbiórek w meczu', emoji: '💪', unit: 'REB' },
  { key: 'ast', label: 'Najwięcej asyst w meczu', emoji: '🎯', unit: 'AST' },
  { key: 'stl', label: 'Najwięcej przechwytów w meczu', emoji: '🦅', unit: 'STL' },
  { key: 'blk', label: 'Najwięcej bloków w meczu', emoji: '🛡️', unit: 'BLK' },
  { key: 'tpm', label: 'Najwięcej trójek w meczu', emoji: '🎯', unit: '3PM' },
  { key: 'teamScore', label: 'Najwyższy wynik drużyny', emoji: '🏀', unit: 'PKT' },
  { key: 'margin', label: 'Najwyższe zwycięstwo', emoji: '💥', unit: 'PKT różnicy' }
];
// Edycja gry z nazwy sezonu („Sezon 1, NBA2K27” → „NBA 2K27”); bez numeru → nazwa sezonu
function _editionOf(seasonId) {
  const name = _seasonName(seasonId);
  const m = name.match(/2k\s*(\d{2})/i);
  return m ? 'NBA 2K' + m[1] : (name || 'Bez sezonu');
}
function _editionsList() {
  const set = new Set();
  _withAllMatches(() => matches.forEach(m => set.add(_editionOf(m.seasonId))));
  return [...set].sort((a, b) => b.localeCompare(a, 'pl', { numeric: true }));
}
function _currentEdition() { return currentSeasonId ? _editionOf(currentSeasonId) : null; }
function _editionMatches(ed) {
  return _withAllMatches(() => ed ? matches.filter(m => _editionOf(m.seasonId) === ed) : matches.slice());
}
let _recordsEdition; // undefined = bieżąca edycja, null = wszech czasów

function _recordEvents(ed) {
  const list = _editionMatches(ed === undefined ? _currentEdition() : ed);
  return (() => {
    const matches = list;
    const best = {}, events = [];
    const consider = (k, value, holder, team, opp, m) => {
      const cur = best[k.key];
      if(!cur || value > cur.value) {
        if(cur && value > 0) events.push({ ...k, value, holder, team, opp, date: m.date, matchId: m.id, prevHolder: cur.holder, prevValue: cur.value });
        best[k.key] = { value, holder };
      }
    };
    [...matches].sort((a, b) => String(a.date).localeCompare(String(b.date)) || (Number(a.id) - Number(b.id))).forEach(m => {
      [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, o]) => {
        _REC_KEYS.slice(0, 6).forEach(k => {
          const top = [...(t.players || [])].sort((a, b) => (b[k.key] || 0) - (a[k.key] || 0))[0];
          if(top && (top[k.key] || 0) > 0) consider(k, top[k.key] || 0, top.name, t.name, o.name, m);
        });
        consider(_REC_KEYS[6], t.score || 0, t.name, t.name, o.name, m);
      });
      const diff = Math.abs((m.team1.score || 0) - (m.team2.score || 0));
      const win = (m.team1.score || 0) > (m.team2.score || 0) ? m.team1 : m.team2, los = win === m.team1 ? m.team2 : m.team1;
      consider(_REC_KEYS[7], diff, win.name, win.name, los.name, m);
    });
    return events.reverse();
  })();
}

function renderRecordsBanner() {
  const el = document.getElementById('records-banner-wrap');
  if(!el) return;
  const cutoff = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const recent = _recordEvents(_currentEdition()).filter(e => String(e.date) >= cutoff).slice(0, 3);
  const admin = _isLoggedInSync();
  el.innerHTML = recent.length ? `
    <div style="background:linear-gradient(135deg,rgba(220,38,38,.14),rgba(245,197,24,.08));border:1px solid rgba(245,197,24,.4);border-radius:12px;padding:.6rem .9rem;margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.35rem">
        <div style="font-size:.66rem;font-weight:800;letter-spacing:2px;color:var(--accent)">🆕 NOWE REKORDY LIGI${_currentEdition() ? ' · ' + _h(_currentEdition()).toUpperCase() : ''}</div>
        <button onclick="_recordsEdition=undefined;openLeagueRecordsModal()" class="btn btn-ghost" style="font-size:.68rem;padding:.2rem .55rem">🏛 Wszystkie rekordy</button>
      </div>
      ${recent.map((e, i) => `<div style="display:flex;align-items:center;gap:.6rem;padding:.3rem 0;${i ? 'border-top:1px solid rgba(255,255,255,.06)' : ''}">
        <span style="font-size:1.15rem">${e.emoji}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:.84rem"><b>${_h(e.label)}:</b> ${_h(e.holder)}${e.team && e.team !== e.holder ? ' (' + _h(e.team) + ')' : ''} — <b style="color:var(--accent)">${e.value} ${e.unit}</b></div>
          <div style="font-size:.68rem;color:var(--muted)">poprzednio ${_h(e.prevHolder)} (${e.prevValue}) · ${formatDate(e.date)} · vs ${_h(e.opp)}</div>
        </div>
        ${admin ? `<button onclick="announceRecord(${i})" class="btn btn-ghost" style="font-size:.68rem;padding:.2rem .5rem">📣</button>` : ''}
      </div>`).join('')}
    </div>` : '';
  window._recentRecords = recent;
}

function announceRecord(){return __lz(4,'announceRecord',this,arguments)}

function _recordsEditionBar() {
  const eds = _editionsList();
  const sel = _recordsEdition === undefined ? _currentEdition() : _recordsEdition;
  const b = (val, label) => {
    const on = val === sel;
    return `<button onclick="_recordsEdition=${val === null ? 'null' : `'${String(val).replace(/'/g, "\'")}'`};openLeagueRecordsModal()" style="font-size:.75rem;padding:.3rem .7rem;border-radius:999px;cursor:pointer;font-family:inherit;
      border:1px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? 'var(--accent)' : 'transparent'};color:${on ? 'rgba(0,0,0,.88)' : 'var(--text)'};font-weight:${on ? 800 : 600}">${_h(label)}</button>`;
  };
  return `<div style="display:flex;gap:.35rem;flex-wrap:wrap;align-items:center;margin-bottom:1rem">
    <span style="font-size:.68rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-right:.2rem">EDYCJA:</span>
    ${eds.map(e => b(e, e)).join('')}${b(null, '🌐 Wszech czasów')}
  </div>`;
}

function _recordsTimelineHtml() {
  const ev = _recordEvents(_recordsEdition === undefined ? _currentEdition() : _recordsEdition).slice(0, 12);
  window._allRecordEvents = ev;
  if(!ev.length) return '';
  const admin = _isLoggedInSync();
  return `<div style="margin-bottom:1.25rem">
    <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">🆕 OSTATNIO POBITE REKORDY</div>
    ${ev.map((e, i) => `<div style="display:flex;align-items:center;gap:.6rem;padding:.4rem .6rem;border-bottom:1px solid var(--border);font-size:.8rem">
      <span>${e.emoji}</span>
      <div style="flex:1;min-width:0"><b>${_h(e.holder)}</b> — ${e.value} ${e.unit} <span style="color:var(--muted)">(${_h(e.label)}, wcześniej ${_h(e.prevHolder)}: ${e.prevValue})</span></div>
      <span style="font-size:.7rem;color:var(--muted)">${formatDate(e.date)}</span>
      ${admin ? `<button onclick="announceRecord(${i},true)" class="btn btn-ghost" style="font-size:.66rem;padding:.15rem .4rem">📣</button>` : ''}
    </div>`).join('')}
  </div>`;
}

// ═══ 👤 PROFILE: odznaki gracza, trofea i rywalizacje drużyny ═══════
function _playerBadgesHtml(name) {
  const badges = [];
  awardsList.filter(a => a && a.status === 'closed' && a.winners).forEach(a => a.categories.forEach(c => {
    const w = a.winners[c.key];
    if(w && String(w.id).split('|')[0] === name) badges.push({ icon: c.emoji || '🏅', text: `${c.title} · Week ${a.week}${_seasonName(a.seasonId) ? ' · ' + _seasonName(a.seasonId) : ''}` });
  }));
  playoffs.filter(po => po.champion).forEach(po => {
    const played = _withAllMatches(() => getPlayoffMatches(po)).some(m => [m.team1, m.team2].some(t => t.name === po.champion && (t.players || []).some(p => p.name === name)));
    if(played) badges.push({ icon: '🏆', text: `Mistrz · ${_seasonName(po.seasonId) || (po.startDate || '').slice(0, 4)}` });
  });
  const teamsBySeason = {};
  _withAllMatches(() => matches.forEach(m => [m.team1, m.team2].forEach(t => {
    if((t.players || []).some(p => p.name === name)) {
      const sn = _seasonName(m.seasonId) || 'Bez sezonu';
      (teamsBySeason[sn] = teamsBySeason[sn] || new Set()).add(t.name);
    }
  })));
  const tr = (transfersList || []).filter(t => t.player === name);
  const achHtml = _playerAchievementsHtml(name);
  if(!badges.length && Object.keys(teamsBySeason).length < 2 && !tr.length && !achHtml) return '';
  return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem .9rem;margin-bottom:1rem">
    ${badges.length ? `<div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.5rem">${badges.map(b => `<span style="font-size:.74rem;background:rgba(245,197,24,.12);border:1px solid rgba(245,197,24,.4);border-radius:999px;padding:.15rem .6rem">${b.icon} ${_h(b.text)}</span>`).join('')}</div>` : ''}
    <div style="font-size:.74rem;color:var(--muted)">🧭 Kariera: ${Object.entries(teamsBySeason).map(([sn, set]) => `<b style="color:var(--text)">${_h(sn)}</b>: ${[...set].map(_h).join(', ')}`).join(' · ')}</div>
    ${tr.length ? `<div style="font-size:.74rem;color:var(--muted);margin-top:.25rem">🔁 ${tr.map(t => `${_h(t.from || 'Wolny agent')} ➜ ${_h(t.to)} (${new Date(t.at).toLocaleDateString('pl-PL')})`).join(' · ')}</div>` : ''}
    ${achHtml}
  </div>`;
}

function _teamExtrasHtml(tn) {
  const trophies = [];
  playoffs.forEach(po => {
    const sn = _seasonName(po.seasonId) || (po.startDate || '').slice(0, 4);
    if(po.champion === tn) trophies.push(`🏆 Mistrz · ${sn}`);
    else {
      const fin = [...(po.rounds || [])].reverse().find(r => /fina/i.test(r.name) && !/3/.test(r.name));
      if(po.champion && fin?.pairs?.some(p => p.team1 === tn || p.team2 === tn)) trophies.push(`🥈 Finał · ${sn}`);
    }
  });
  awardsList.filter(a => a.status === 'closed' && a.winners).forEach(a => a.categories.forEach(c => {
    const w = a.winners[c.key];
    if(w && (w.team === tn || String(w.id).split('|')[1] === tn)) trophies.push(`${c.emoji || '🏅'} ${c.title} (${w.label}) · Week ${a.week}`);
  }));
  const h2h = {};
  _withAllMatches(() => matches.forEach(m => {
    if(m.team1.name !== tn && m.team2.name !== tn) return;
    const me = m.team1.name === tn ? m.team1 : m.team2, op = me === m.team1 ? m.team2 : m.team1;
    const x = h2h[op.name] = h2h[op.name] || { w: 0, l: 0, sw: 0, sl: 0 };
    const win = me.score > op.score;
    win ? x.w++ : x.l++;
    if(currentSeasonId && m.seasonId === currentSeasonId) win ? x.sw++ : x.sl++;
  }));
  const rows = Object.entries(h2h).sort((a, b) => (b[1].w + b[1].l) - (a[1].w + a[1].l)).slice(0, 10);
  const tr = (transfersList || []).filter(t => t.to === tn || t.from === tn).slice(0, 6);
  if(!trophies.length && !rows.length && !tr.length) return '';
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:.75rem;margin-bottom:1.25rem">
    ${trophies.length ? `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem .9rem">
      <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">GABLOTA</div>
      ${trophies.map(t => `<div style="font-size:.8rem;margin-bottom:.2rem">${_h(t)}</div>`).join('')}</div>` : ''}
    ${rows.length ? `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem .9rem">
      <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">BILANS Z RYWALAMI <span style="font-weight:600">(wszystkie sezony · ten sezon)</span></div>
      ${rows.map(([op, x]) => `<div style="display:flex;justify-content:space-between;gap:.5rem;font-size:.78rem;margin-bottom:.15rem">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(op)}</span>
        <span><b style="color:${x.w >= x.l ? 'var(--win)' : 'var(--loss)'}">${x.w}-${x.l}</b>${x.sw + x.sl ? ` <span style="color:var(--muted)">· ${x.sw}-${x.sl}</span>` : ''}</span>
      </div>`).join('')}</div>` : ''}
    ${tr.length ? `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem .9rem">
      <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">TRANSFERY</div>
      ${tr.map(t => `<div style="font-size:.78rem;margin-bottom:.15rem">${t.to === tn ? '➕' : '➖'} ${_h(t.player)} <span style="color:var(--muted)">${t.to === tn ? 'z ' + _h(t.from || 'wolnych agentów') : 'do ' + _h(t.to)}</span></div>`).join('')}</div>` : ''}
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// PAKIET 2: ranking siły (Elo) + prognozy, typer playoffów,
//           osiągnięcia, plakat meczu, kronika ligi
// ═══════════════════════════════════════════════════════════════
let bracketData = {};   // { poId: { count, locked, maxPts, leaders, championPicks } } z Workera
let myBracket = {};     // { poId: picks }
let _bracketDraft = null;

// ═══ ⚡ RANKING SIŁY (Elo) ═══════════════════════════════════════
let _eloCache = null;
function _elo(ed) {
  const edition = ed === undefined ? _currentEdition() : ed;
  const list = _editionMatches(edition).sort((a, b) => String(a.date).localeCompare(String(b.date)) || (Number(a.id) - Number(b.id)));
  const key = (edition || '*') + '|' + list.length + '|' + (list[list.length - 1]?.id || '');
  if(_eloCache && _eloCache.key === key) return _eloCache;
  const R = {}, hist = {};
  list.forEach(m => {
    const a = m.team1?.name, b = m.team2?.name;
    if(!a || !b) return;
    const ra = R[a] ?? 1500, rb = R[b] ?? 1500;
    const sa = m.team1.score || 0, sb = m.team2.score || 0;
    const aWin = sa > sb;
    const ea = 1 / (1 + Math.pow(10, (rb - ra) / 400));
    const gap = aWin ? ra - rb : rb - ra;
    const mult = Math.max(0.5, Math.log(Math.abs(sa - sb) + 1)) * (2.2 / (gap * 0.001 + 2.2));
    const delta = 32 * mult * ((aWin ? 1 : 0) - ea);
    R[a] = ra + delta; R[b] = rb - delta;
    (hist[a] = hist[a] || []).push({ date: m.date, r: R[a] });
    (hist[b] = hist[b] || []).push({ date: m.date, r: R[b] });
  });
  _eloCache = { key, edition, R, hist, games: list.length };
  return _eloCache;
}
function _eloProb(t1, t2) {
  const e = _elo();
  const r1 = e.R[t1] ?? 1500, r2 = e.R[t2] ?? 1500;
  return 1 / (1 + Math.pow(10, (r2 - r1) / 400));
}
function _eloLine(s) {
  const e = _elo();
  if(!e.games) return '';
  const p = Math.round(_eloProb(s.team1, s.team2) * 100);
  const fav = p >= 50 ? 1 : 2;
  return `<div title="Prognoza z rankingu siły (Elo) — szansa na wygranie pojedynczego meczu" style="display:flex;align-items:center;justify-content:center;gap:.4rem;font-size:.7rem;color:var(--muted);margin-top:.45rem">
    ⚡ <b style="color:${fav === 1 ? 'var(--text)' : 'var(--muted)'}">${p}%</b>
    <span style="display:inline-flex;width:70px;height:4px;border-radius:2px;overflow:hidden;background:var(--surface2)"><span style="width:${p}%;background:#a78bfa"></span></span>
    <b style="color:${fav === 2 ? 'var(--text)' : 'var(--muted)'}">${100 - p}%</b> <span>prognoza</span>
  </div>`;
}

function _sparkline(points, w, h, color) {
  if(!points || points.length < 2) return '';
  const ys = points.map(p => p.r), min = Math.min(...ys), max = Math.max(...ys), span = Math.max(1, max - min);
  const d = points.map((p, i) => `${(i / (points.length - 1) * w).toFixed(1)},${(h - (p.r - min) / span * h).toFixed(1)}`).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible"><polyline points="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

function renderEloDashboard() {
  const el = document.getElementById('elo-wrap');
  if(!el) return;
  const e = _elo();
  const teams = Object.keys(e.R);
  if(!e.games || teams.length < 2) { el.innerHTML = ''; return; }
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const rows = teams.map(t => {
    const h = e.hist[t] || [];
    const before = [...h].reverse().find(x => String(x.date) < weekAgo);
    return { team: t, r: e.R[t], d: before ? e.R[t] - before.r : (h.length ? e.R[t] - 1500 : 0), h };
  }).sort((a, b) => b.r - a.r);
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem">
      <div class="section-title" style="margin-bottom:0;font-size:1.3rem">⚡ Ranking siły${e.edition ? ' <span style="color:var(--muted);font-size:.75em">· ' + _h(e.edition) + '</span>' : ''}</div>
      <button onclick="openEloChart()" class="btn btn-ghost" style="font-size:.72rem;padding:.25rem .6rem">📈 Wykres</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:1.5rem">
      ${rows.slice(0, 12).map((x, i) => `<div style="display:grid;grid-template-columns:28px 30px 1fr 90px 64px 52px;align-items:center;gap:.6rem;padding:.45rem .9rem;border-bottom:1px solid var(--border)">
        <b style="font-family:'Barlow Condensed',sans-serif;font-size:1.1rem;color:${i < 3 ? 'var(--accent)' : 'var(--muted)'}">${i + 1}</b>
        ${teamLogo(x.team, 26, '.6rem')}
        <span style="font-weight:700;font-size:.86rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(x.team)}</span>
        <span style="text-align:right">${_sparkline(x.h.length <= 12 ? [{ r: 1500 }, ...x.h] : x.h.slice(-12), 80, 20, typeof teamColor === 'function' ? teamColor(x.team) : '#a78bfa')}</span>
        <b style="font-family:'Barlow Condensed',sans-serif;font-size:1.1rem;text-align:right">${Math.round(x.r)}</b>
        <span style="font-size:.74rem;font-weight:800;text-align:right;color:${x.d > 0.5 ? 'var(--win)' : x.d < -0.5 ? 'var(--loss)' : 'var(--muted)'}">${x.d > 0.5 ? '▲' : x.d < -0.5 ? '▼' : '='}${Math.abs(Math.round(x.d)) || ''}</span>
      </div>`).join('')}
      <div style="padding:.4rem .9rem;font-size:.68rem;color:var(--muted)">Start 1500. Wygrana z mocniejszym rywalem i wyższą różnicą punktów daje więcej. Strzałka = zmiana w ostatnich 7 dniach.</div>
    </div>`;
}

function openEloChart(){return __lz(4,'openEloChart',this,arguments)}

// ═══ 🏆 TYPER PLAYOFFÓW ══════════════════════════════════════════
function _poMain(po) { return (po.rounds || []).filter(r => !/3/.test(r.name || '')); }
function _poThird(){return __lz(4,'_poThird',this,arguments)}
function _bracketSlots(){return __lz(4,'_bracketSlots',this,arguments)}
function _bracketReady(po) { const r0 = _poMain(po)[0]; return !!r0 && r0.pairs.length >= 1 && r0.pairs.every(p => p.team1 && p.team2); }

function bracketAnnounce(){return __lz(4,'bracketAnnounce',this,arguments)}
function renderBracketDashboard() {
  const el = document.getElementById('bracket-wrap');
  if(!el) return;
  const po = typeof getActivePlayoff === 'function' ? getActivePlayoff() : null;
  if(!po || !_bracketReady(po)) { el.innerHTML = ''; return; }
  const bd = bracketData[String(po.id)] || { count: 0, locked: false, leaders: [], championPicks: {} };
  const mine = myBracket[String(po.id)];
  const main = _poMain(po);
  const champKey = `r${main.length - 1}p0`;
  const cp = Object.entries(bd.championPicks || {}).sort((a, b) => b[1] - a[1]);
  const totCp = cp.reduce((s, x) => s + x[1], 0);
  const me = discordUser?.id;
  window._bracketAnn = { po, bd };
  const myIdx = (bd.leaders || []).findIndex(x => x.id === me);
  const lb = (bd.leaders || []).slice(0, 10).map((x, i) => `<div style="display:grid;grid-template-columns:26px 24px 1fr auto auto;gap:.5rem;align-items:center;padding:.35rem .6rem;border-bottom:1px solid var(--border);${x.id === me ? 'background:rgba(245,197,24,.08)' : ''}">
      <b style="color:${i < 3 ? 'var(--accent)' : 'var(--muted)'}">${['🥇', '🥈', '🥉'][i] || i + 1}</b>${_avatarHtml(x.avatar, 22)}
      <span style="font-size:.82rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(x.name)}</span>
      <span style="font-size:.68rem;color:var(--muted)">🏆 ${_h(x.champion || '—')}</span>
      <b style="font-family:'Barlow Condensed',sans-serif;color:var(--accent)">${x.pts}</b>
    </div>`).join('');
  el.innerHTML = `<div style="background:var(--surface);border:1px solid rgba(245,197,24,.35);border-radius:12px;padding:.85rem 1rem;margin-bottom:1.5rem">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem">
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.25rem;letter-spacing:1px">🏆 Typer playoffów</div>
        ${_isLoggedInSync() ? `<div style="display:flex;gap:.3rem;margin-top:.3rem;flex-wrap:wrap"><button class="btn btn-ghost" style="font-size:.66rem;padding:.12rem .45rem" onclick="bracketAnnounce('start')">📣 Ogłoś typowanie</button><button class="btn btn-ghost" style="font-size:.66rem;padding:.12rem .45rem" onclick="bracketAnnounce('winners')">🏆 Ogłoś zwycięzców typowania</button></div>` : ''}
        <div style="font-size:.72rem;color:var(--muted)">${bd.locked ? `Typowanie zamknięte · ${bd.count} uczestników · maks. ${bd.maxPts || '?'} pkt` : `Wytypuj całą drabinkę${po.startDate ? ' do ' + _ssFmt(po.startDate) : ''} · ${bd.count} już typuje · punkty rosną w kolejnych rundach: ${main.map((_, ri) => 2 ** ri).join(' / ')}`}</div>
      </div>
      ${!bd.locked ? `<button onclick="openBracketPicker()" class="btn btn-primary" style="font-size:.8rem;padding:.35rem .85rem">${mine ? '✏️ Zmień typy' : '📝 Wypełnij drabinkę'}</button>` : ''}
    </div>
    ${mine ? `<div style="font-size:.78rem;margin-bottom:.6rem">Twój mistrz: <b style="color:var(--accent)">${_h(mine[champKey] || '—')}</b>${myIdx >= 0 && bd.locked ? ` · Twoje miejsce: <b>${myIdx + 1}</b> (${bd.leaders[myIdx].pts} pkt)` : ''}</div>` : ''}
    ${cp.length ? `<div style="margin-bottom:${bd.locked ? '.7rem' : 0}">
      <div style="font-size:.66rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.3rem">KOGO KIBICE WIDZĄ JAKO MISTRZA</div>
      ${cp.slice(0, 5).map(([t, n]) => `<div style="display:grid;grid-template-columns:22px 130px 1fr 36px;gap:.45rem;align-items:center;margin-bottom:.2rem;font-size:.76rem">
        ${teamLogo(t, 20, '.5rem')}<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(t)}</span>
        <span style="height:6px;border-radius:3px;background:var(--surface2);overflow:hidden"><span style="display:block;height:100%;width:${Math.round(n / totCp * 100)}%;background:var(--accent)"></span></span>
        <b style="text-align:right">${Math.round(n / totCp * 100)}%</b></div>`).join('')}
    </div>` : ''}
    ${bd.locked && lb ? `<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden">${lb}</div>` : ''}
  </div>`;
}

function openBracketPicker(){return __lz(4,'openBracketPicker',this,arguments)}

function _bracketPick(){return __lz(4,'_bracketPick',this,arguments)}

function _renderBracketPicker(){return __lz(4,'_renderBracketPicker',this,arguments)}

function saveBracket(){return __lz(4,'saveBracket',this,arguments)}

// ═══ 🎖 OSIĄGNIĘCIA ══════════════════════════════════════════════
const _ACH = [
  { key: 'td',    icon: '🔺', name: 'Triple-double',                    rare: true,  test: p => ['pts', 'reb', 'ast', 'stl', 'blk'].filter(k => (p[k] || 0) >= 10).length >= 3 },
  { key: 'p50',   icon: '🌋', name: '50+ punktów w meczu',              rare: true,  test: p => (p.pts || 0) >= 50 },
  { key: 'p40',   icon: '🔥', name: '40+ punktów w meczu',              rare: true,  test: p => (p.pts || 0) >= 40 && (p.pts || 0) < 50 },
  { key: 'tp8',   icon: '🌧️', name: 'Ulewa trójek (8+ 3PM)',             rare: true,  test: p => (p.tpm || 0) >= 8 },
  { key: 'tp5',   icon: '🎯', name: 'Deszcz trójek (5+ 3PM)',           rare: false, test: p => (p.tpm || 0) >= 5 && (p.tpm || 0) < 8 },
  { key: 'fg100', icon: '💯', name: 'Bezbłędny (100% FG, min. 8 rzutów)', rare: true,  test: p => (p.fga || 0) >= 8 && (p.fgm || 0) === (p.fga || 0) },
  { key: 'reb15', icon: '💪', name: 'Władca tablic (15+ REB)',          rare: false, test: p => (p.reb || 0) >= 15 },
  { key: 'ast12', icon: '🧠', name: 'Mózg operacji (12+ AST)',          rare: false, test: p => (p.ast || 0) >= 12 },
  { key: 'stl5',  icon: '🦅', name: 'Złodziej (5+ STL)',                rare: false, test: p => (p.stl || 0) >= 5 },
  { key: 'blk5',  icon: '🛡️', name: 'Mur (5+ BLK)',                      rare: false, test: p => (p.blk || 0) >= 5 }
];
const _ACH_CAREER = [
  { key: 'gp', icon: '🎽', name: n => `Weteran — ${n} meczów`, steps: [10, 25, 50, 100], rare: n => n >= 50 },
  { key: 'pts', icon: '💰', name: n => `${n} punktów w karierze`, steps: [500, 1000, 2500, 5000], rare: n => n >= 1000 },
  { key: 'streak', icon: '⚡', name: n => `Seria ${n} wygranych z rzędu`, steps: [5, 10], rare: n => n >= 10 }
];

let _achCache = null;
function _achievements(ed) {
  const list = _editionMatches(ed).sort((a, b) => String(a.date).localeCompare(String(b.date)) || (Number(a.id) - Number(b.id)));
  const key = (ed || '*') + '|' + list.length + '|' + (list[list.length - 1]?.id || '');
  if(_achCache && _achCache.key === key) return _achCache.events;
  const events = [], career = {};
  list.forEach(m => {
    [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, o]) => {
      const won = (t.score || 0) > (o.score || 0);
      (t.players || []).forEach(p => {
        if(!p.name) return;
        const base = { player: p.name, team: t.name, opp: o.name, date: m.date, matchId: m.id };
        _ACH.forEach(a => { if(a.test(p)) events.push({ ...base, key: a.key, icon: a.icon, name: a.name, rare: a.rare, value: `${p.pts || 0} PTS · ${p.reb || 0} REB · ${p.ast || 0} AST` }); });
        const c = career[p.name] = career[p.name] || { gp: 0, pts: 0, streak: 0 };
        const prev = { ...c };
        c.gp++; c.pts += p.pts || 0; c.streak = won ? c.streak + 1 : 0;
        _ACH_CAREER.forEach(a => a.steps.forEach(n => {
          if(prev[a.key] < n && c[a.key] >= n) events.push({ ...base, key: a.key + n, icon: a.icon, name: a.name(n), rare: a.rare(n), career: true, value: a.key === 'pts' ? `${c.pts} pkt łącznie` : '' });
        }));
      });
    });
  });
  events.reverse();
  _achCache = { key, events };
  return events;
}

function renderAchievementsDashboard() {
  const el = document.getElementById('ach-wrap');
  if(!el) return;
  const cutoff = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const recent = _achievements(_currentEdition()).filter(e => String(e.date) >= cutoff)
    .sort((a, b) => (b.rare - a.rare) || String(b.date).localeCompare(String(a.date))).slice(0, 6);
  window._recentAch = recent;
  const admin = _isLoggedInSync();
  el.innerHTML = recent.length ? `<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:.6rem .9rem;margin-bottom:1rem">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.35rem"><div style="font-size:.66rem;font-weight:800;letter-spacing:2px;color:var(--muted)">🎖 NOWE OSIĄGNIĘCIA</div>
      ${admin ? `<button onclick="openWebhookModal('achievements')" class="btn btn-ghost" style="font-size:.64rem;padding:.12rem .45rem">⚙ ${_whStatus?.achAuto === 'off' ? 'ogłaszanie wyłączone' : 'ogłaszają się same'}</button>` : ''}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:.35rem .8rem">
      ${recent.map((e, i) => `<div style="display:flex;align-items:center;gap:.5rem;padding:.25rem 0">
        <span style="font-size:1.15rem">${e.icon}</span>
        <div style="flex:1;min-width:0;font-size:.8rem;line-height:1.3">
          <b style="cursor:pointer" onclick="openPlayerModal(this.dataset.p, this.dataset.t)" data-p="${_h(e.player)}" data-t="${_h(e.team)}">${_h(e.player)}</b> <span style="color:var(--muted)">(${_h(e.team)})</span><br>
          <span style="color:${e.rare ? 'var(--accent)' : 'var(--text)'};font-weight:${e.rare ? 800 : 500}">${_h(e.name)}</span> <span style="font-size:.68rem;color:var(--muted)">· ${_ssFmt(e.date)}</span>
        </div>
        ${admin ? `<button onclick="announceAchievement(${i})" class="btn btn-ghost" style="font-size:.64rem;padding:.15rem .4rem">📣</button>` : ''}
      </div>`).join('')}
    </div>
  </div>` : '';
}

function announceAchievement(){return __lz(4,'announceAchievement',this,arguments)}

function _playerAchievementsHtml(name) {
  const evs = _achievements(null).filter(e => e.player === name);
  if(!evs.length) return '';
  const groups = {};
  evs.forEach(e => { const g = groups[e.name] = groups[e.name] || { icon: e.icon, rare: e.rare, n: 0, last: e.date }; g.n++; });
  return `<div style="margin-top:.5rem"><div style="font-size:.66rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.3rem">🎖 OSIĄGNIĘCIA</div>
    <div style="display:flex;gap:.3rem;flex-wrap:wrap">${Object.entries(groups).sort((a, b) => (b[1].rare - a[1].rare) || (b[1].n - a[1].n)).map(([nm, g]) =>
      `<span title="ostatnio ${_ssFmt(g.last)}" style="font-size:.72rem;border-radius:999px;padding:.12rem .55rem;border:1px solid ${g.rare ? 'rgba(167,139,250,.6)' : 'var(--border)'};background:${g.rare ? 'rgba(167,139,250,.12)' : 'transparent'}">${g.icon} ${_h(nm)}${g.n > 1 ? ' ×' + g.n : ''}</span>`).join('')}</div></div>`;
}

function _gameMvp(){return __lz(4,'_gameMvp',this,arguments)}

function _matchPoster(){return __lz(4,'_matchPoster',this,arguments)}

function openMatchPoster(){return __lz(4,'openMatchPoster',this,arguments)}
function _copyPoster(){return __lz(4,'_copyPoster',this,arguments)}
function _sendPoster(){return __lz(4,'_sendPoster',this,arguments)}

// ═══ 📜 KRONIKA LIGI ═════════════════════════════════════════════
let _chron = { ed: undefined, types: null, limit: 80 };
const _CHRON_TYPES = { result: '🏀 Wyniki', transfer: '🔁 Transfery', record: '🏛 Rekordy', ach: '🎖 Osiągnięcia', award: '🏅 Nagrody', champ: '🏆 Mistrzowie', team: '✅ Drużyny', power: '📊 Power Ranking' };

function _chronicleItems(ed) {
  const items = [];
  const inEd = sid => !ed || _editionOf(sid) === ed;
  _editionMatches(ed).forEach(m => {
    const w = (m.team1.score || 0) > (m.team2.score || 0) ? m.team1 : m.team2, l = w === m.team1 ? m.team2 : m.team1;
    items.push({ type: 'result', date: m.date, icon: '🏀', html: `<b>${_h(w.name)}</b> ${w.score}:${l.score} ${_h(l.name)}`, poster: m.id });
  });
  (transfersList || []).filter(t => !ed || !t.seasonId || inEd(t.seasonId)).forEach(t => items.push({ type: 'transfer', date: String(t.at).slice(0, 10), icon: '🔁', html: `<b>${_h(t.player)}</b>: ${_h(t.from || 'Wolny agent')} ➜ <b>${_h(t.to)}</b>` }));
  _recordEvents(ed).forEach(e => items.push({ type: 'record', date: e.date, icon: e.emoji, html: `Rekord: <b>${_h(e.label)}</b> — ${_h(e.holder)} (${e.value} ${e.unit}), wcześniej ${_h(e.prevHolder)} (${e.prevValue})` }));
  _achievements(ed).filter(e => e.rare).forEach(e => items.push({ type: 'ach', date: e.date, icon: e.icon, html: `<b>${_h(e.player)}</b> (${_h(e.team)}) — ${_h(e.name)}` }));
  awardsList.filter(a => a.status === 'closed' && a.winners && (!ed || inEd(a.seasonId))).forEach(a => a.categories.forEach(c => {
    const w = a.winners[c.key];
    if(w) items.push({ type: 'award', date: String(a.closedAt || a.createdAt).slice(0, 10), icon: c.emoji || '🏅', html: `${_h(c.title)} Week ${a.week}: <b>${_h(w.label)}</b>` });
  }));
  playoffs.filter(po => po.champion && (!ed || inEd(po.seasonId))).forEach(po => {
    const last = _withAllMatches(() => getPlayoffMatches(po)).map(m => m.date).sort().pop() || po.startDate || '';
    items.push({ type: 'champ', date: last, icon: '🏆', html: `<b>${_h(po.champion)}</b> mistrzem ${_h(_seasonName(po.seasonId) || 'sezonu')}!` });
  });
  teamRegistrations.filter(r => r.status === 'approved' && (!ed || inEd(r.seasonId))).forEach(r => items.push({ type: 'team', date: String(r.reviewedAt || r.registeredAt || '').slice(0, 10), icon: '✅', html: `<b>${_h(r.teamName)}</b> dołącza do ligi` }));
  (powerRankings || []).filter(p => !ed || inEd(p.seasonId)).forEach(p => p.entries?.[0] && items.push({ type: 'power', date: String(p.createdAt).slice(0, 10), icon: '📊', html: `Power Ranking Week ${p.week}: liderem <b>${_h(p.entries[0].team)}</b>` }));
  return items.filter(x => x.date).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function openChronicle() {
  if(_chron.types === null) _chron.types = new Set(Object.keys(_CHRON_TYPES));
  const ed = _chron.ed === undefined ? _currentEdition() : _chron.ed;
  const all = _chronicleItems(ed).filter(x => _chron.types.has(x.type));
  const shown = all.slice(0, _chron.limit);
  const eds = _editionsList();
  const chip = (on, onclick, label) => `<button onclick="${onclick}" style="font-size:.72rem;padding:.25rem .6rem;border-radius:999px;cursor:pointer;font-family:inherit;border:1px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? 'rgba(245,197,24,.15)' : 'transparent'};color:${on ? 'var(--accent)' : 'var(--text)'}">${label}</button>`;
  let lastDate = '';
  const rows = shown.map(x => {
    const head = x.date !== lastDate ? `<div style="font-size:.68rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.7rem 0 .25rem;text-transform:uppercase">${formatDate(x.date)}</div>` : '';
    lastDate = x.date;
    return head + `<div style="display:flex;align-items:center;gap:.55rem;padding:.3rem .5rem;border-left:2px solid var(--border);margin-left:.3rem;font-size:.82rem">
      <span>${x.icon}</span><span style="flex:1">${x.html}</span>
      ${x.poster ? `<button onclick="openMatchPoster(${x.poster})" class="btn btn-ghost" title="Plakat meczu" style="font-size:.64rem;padding:.1rem .4rem">🖼</button>` : ''}
    </div>`;
  }).join('');
  const m = _fxModal('chronicle-modal', 720);
  m.querySelector('.modal').innerHTML = _fxHead('chronicle-modal', '📜 Kronika ligi') + `
    <div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:.45rem">
      ${eds.map(e => chip(e === ed, `_chron.ed='${String(e).replace(/'/g, "\\'")}';_chron.limit=80;openChronicle()`, _h(e))).join('')}
      ${chip(ed === null, `_chron.ed=null;_chron.limit=80;openChronicle()`, '🌐 Wszystko')}
    </div>
    <div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:.6rem">
      ${Object.entries(_CHRON_TYPES).map(([k, l]) => chip(_chron.types.has(k), `_chron.types.has('${k}')?_chron.types.delete('${k}'):_chron.types.add('${k}');openChronicle()`, l)).join('')}
    </div>
    <div style="max-height:60vh;overflow-y:auto;padding-right:.3rem">${rows || '<div style="color:var(--muted);text-align:center;padding:2rem">Brak wydarzeń</div>'}
      ${all.length > shown.length ? `<div style="text-align:center;margin-top:.8rem"><button class="btn btn-ghost" onclick="_chron.limit+=120;openChronicle()">Pokaż więcej (${all.length - shown.length})</button></div>` : ''}
    </div>`;
  m.classList.add('open');
}

// ═══ Skróty na Dashboardzie ═══
function renderQuickLinks() {
  const el = document.getElementById('quicklinks-wrap');
  if(!el) return;
  const b = (onclick, label) => `<button onclick="${onclick}" class="btn btn-ghost" style="font-size:.76rem;padding:.35rem .75rem">${label}</button>`;
  el.innerHTML = `<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1.25rem">
    ${!_isStandalone() ? `<button onclick="installApp()" class="btn btn-primary" style="font-size:.76rem;padding:.35rem .75rem">📲 Zainstaluj aplikację</button>` : ''}
    ${b("showView('teams')", '👥 Drużyny i składy')}
    ${b("showView('podcast')", '🎧 Podcast')}
    ${b("showView('kordle')", '🧩 2Kordle')}
    ${b("showView('fans')", '🏅 Liga kibiców')}
    ${b("showView('cards')", '🃏 Kolekcja kart')}
    ${_gmVisible() ? b("showView('gm')", '🏆 Liga GM') : ''}
    ${discordUser ? b('_wr.tab=null;openWrapped()', '🎁 Mój Wrapped') : ''}
    ${b('openChronicle()', '📜 Kronika ligi')}
    ${b("document.getElementById('elo-wrap')?.scrollIntoView({behavior:'smooth'})", '⚡ Ranking siły')}
    ${b('_recordsEdition=undefined;openLeagueRecordsModal()', '🏛 Rekordy')}
    ${b('openChampionsHistory()', '📜 Historia mistrzów')}
    ${discordUser ? b('openMyPanel()', '👤 Mój panel') : ''}
    ${_isLoggedInSync() ? `<span style="flex:1"></span>${(() => { const n = _adminGroups().reduce((x, g) => x + g.badge, 0); return `<button onclick="openAdminHub()" class="btn btn-ghost" style="font-size:.76rem;padding:.35rem .75rem;${n ? 'border-color:#f59e0b;color:#f59e0b;font-weight:800' : ''}">🛠 Panel admina${n ? ' (' + n + ')' : ''}</button>`; })()}` : ''}
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// PAKIET 3: kopie, dziennik, kary i walkowery, Mój panel, dostępność,
//           karta zawodnika, transmisje i „na żywo”, akcje meczu,
//           zmiany składu, scenariusze awansu, gala sezonu, pakiet tygodnia
// ═══════════════════════════════════════════════════════════════
let playersList = [];      // profile graczy (Mój panel / dostępność)
let streamsData = {};      // { scheduleId: { team1: url, team2: url } }
let clipsList = [];        // akcje meczu
let myClipLikes = new Set();
let myProfile = null;
let penalties = [];        // kary (w danych ligi)
let rosterLockDate = null; // okno transferowe — zmiany składu do tej daty
let discordRoleCfg = { guildId: '', member: '', captain: '' }; // role Discord nadawane automatycznie
let teamAliasMap = {}; // { 'poland': 'Polish Aliens' } — nazwy z Pro-Am → drużyny ze strony (wspólne dla strony i Workera)

const DOW = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
function _plPL(n, one, few, many) { if(n === 1) return one; const d = n % 10, h = n % 100; return d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many; }
function _today() { return new Date().toLocaleDateString('sv-SE'); }
function _audit(){return __lz(4,'_audit',this,arguments)}

function openBackups(){return __lz(4,'openBackups',this,arguments)}
function backupNow(){return __lz(4,'backupNow',this,arguments)}
function downloadBackup(){return __lz(4,'downloadBackup',this,arguments)}
function restoreBackup(){return __lz(4,'restoreBackup',this,arguments)}
function _restoreGo(){return __lz(4,'_restoreGo',this,arguments)}


function openAudit(){return __lz(4,'openAudit',this,arguments)}
function _renderAudit(){return __lz(4,'_renderAudit',this,arguments)}

// ═══ ⚖️ KARY ═════════════════════════════════════════════════════
function _penaltiesFor(sid) { return (penalties || []).filter(p => (p.seasonId || null) === (sid || null)); }
function openPenalties(){return __lz(4,'openPenalties',this,arguments)}
function addPenalty(){return __lz(4,'addPenalty',this,arguments)}
function removePenalty(){return __lz(4,'removePenalty',this,arguments)}
function renderPenaltiesNote() {
  const el = document.getElementById('penalties-note');
  if(!el) return;
  const list = _penaltiesFor(currentSeasonId || null);
  el.innerHTML = list.length ? `<div style="font-size:.76rem;color:var(--muted);margin:-.75rem 0 1.25rem;padding:.4rem .2rem">⚖️ Kary: ${list.map(p => `<b style="color:var(--loss)">${_h(p.team)} −${p.points}</b> (${_h(p.reason)})`).join(' · ')}</div>` : '';
}

function ssWalkover(){return __lz(4,'ssWalkover',this,arguments)}
function confirmWalkover(){return __lz(4,'confirmWalkover',this,arguments)}

// ═══ 📺 TRANSMISJE i 🔴 NA ŻYWO ═══════════════════════════════════
function _matchWindow(s) {
  if(!s.date) return null;
  const t = /^\d{2}:\d{2}$/.test(s.time || '') ? s.time : '20:00';
  const start = new Date(s.date + 'T' + t).getTime();
  return { start, end: start + (45 * (s.bestOf || 1) + 15) * 60e3 };
}
// wszystkie mecze spotkania mają już wynik — zapisany albo wgrany screenem i czekający na potwierdzenie rywala
function _ssSubmittedAll(s) {
  if(s.played) return true;
  const res = _ssResult({ demo: false }, s); if(res?.done) return true;
  const saved = res?.games?.length || 0, pend = (pendingResults || []).filter(p => String(p.scheduleId) === String(s.id)).length;
  return saved + pend >= (s.bestOf || 1);
}
function _isLive(s) { const w = _matchWindow(s); const n = Date.now(); return !!w && n >= w.start - 5 * 60e3 && n <= w.end && !s.played && !_ssSubmittedAll(s); }
function _teamRegByName(name) { return teamRegistrations.find(r => r.status === 'approved' && String(r.teamName).toLowerCase() === String(name).toLowerCase()); }
// Link do transmisji dla strony meczu: własny link meczu → stały kanał drużyny; „-” = mecz bez transmisji
function _effStream(s, side) {
  const v = (streamsData[String(s.id)] || {})[side];
  if(v === '-') return null;
  return v || _teamRegByName(s[side])?.streamUrl || null;
}
function _streamLinks(s, small) {
  const links = ['team1', 'team2'].map(sd => [sd, _effStream(s, sd)]).filter(x => x[1])
    .map(([sd, u]) => { const lv = typeof _chanLive === 'function' ? _chanLive(u) : null;
      return `<a href="${_h(u)}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none;font-weight:700" ${lv ? `title="${_h(lv.title || '')}"` : ''}>📺 ${_h(s[sd])}${lv ? ` <span style="background:#9146ff;color:#fff;font-size:.62rem;font-weight:900;border-radius:4px;padding:.02rem .3rem">● ${lv.viewers}</span>` : ''}</a>`; });
  return links.length ? `<span style="font-size:${small ? '.7rem' : '.76rem'}">${links.join(' · ')}</span>` : '';
}
function openStreamModal(){return __lz(4,'openStreamModal',this,arguments)}
function _resizeLogo(){return __lz(4,'_resizeLogo',this,arguments)}

function changeTeamLogo(){return __lz(4,'changeTeamLogo',this,arguments)}

function openTeamXModal(){return __lz(4,'openTeamXModal',this,arguments)}
function saveTeamX(){return __lz(4,'saveTeamX',this,arguments)}
// przypomnienie dla kapitana: profil X nieuzupełniony (raz na dzień, do czasu uzupełnienia albo „nie mamy profilu”)
function _captainXNudge() {
  if(!discordUser || document.getElementById('cap-x-nudge')) return;
  const reg = teamRegistrations.find(r => r.status === 'approved' && r.captain?.id === discordUser.id && (!r.seasonId || !currentSeasonId || r.seasonId === currentSeasonId));
  if(!reg || reg.xHandle) return;
  const today = new Date().toISOString().slice(0, 10); if(localStorage.getItem('nba2k_xh_later') === today) return;
  const el = document.createElement('div'); el.id = 'cap-x-nudge'; el.setAttribute('data-notr', '');
  el.style.cssText = 'position:fixed;right:16px;bottom:calc(90px + env(safe-area-inset-bottom,0px));z-index:870;max-width:340px;background:var(--surface);border:1px solid var(--accent);border-radius:14px;padding:.75rem .9rem;box-shadow:0 10px 28px rgba(0,0,0,.45);font-size:.82rem';
  el.innerHTML = `<b>🐦 ${_g('Uzupełnij profil X drużyny', 'Add your team\u2019s X profile')}</b><div style="color:var(--muted);margin:.3rem 0 .5rem">${_g(`Kapitanie ${_h(reg.teamName)}! Podaj profil drużyny na X — liga oznaczy Was we wpisach z podsumowaniem kolejki.`, `Captain of ${_h(reg.teamName)}! Add your team\u2019s X profile — the league will tag you in round summary posts.`)}</div>
    <div style="display:flex;gap:.4rem;justify-content:flex-end"><button class="btn btn-ghost" style="font-size:.72rem" onclick="localStorage.setItem('nba2k_xh_later','${today}');document.getElementById('cap-x-nudge').remove()">${_g('Później', 'Later')}</button><button class="btn btn-primary" style="font-size:.72rem" onclick="openTeamXModal('${reg.id}')">${_g('Uzupełnij', 'Add it')}</button></div>`;
  document.body.appendChild(el);
}
function openTeamStreamModal(){return __lz(4,'openTeamStreamModal',this,arguments)}
function saveTeamStream(){return __lz(4,'saveTeamStream',this,arguments)}
function saveStreamLinks(){return __lz(4,'saveStreamLinks',this,arguments)}

function renderLiveBanner() {
  setTimeout(() => { try { if(document.body.classList.contains('side-on')) renderSideNav(); } catch(e) {} }, 0);
  const el = document.getElementById('live-wrap');
  if(!el) return;
  const tdy = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' }), ord = x => (x.time || '99:99') + ':' + String(x.id).padStart(8, '0');
  // kanał drużyny na żywo → „na żywo” tylko jej najwcześniejszy dzisiejszy mecz bez kompletu wyników
  const firstToday = team => schedule.filter(x => x.generated && x.date === tdy && !_ssSubmittedAll(x) && (x.team1 === team || x.team2 === team)).sort((a, b) => ord(a).localeCompare(ord(b)))[0];
  const live = schedule.filter(s => s.generated && !_ssSubmittedAll(s) && (_isLive(s) || (s.date === tdy && !s.played && ['team1', 'team2'].some(sd => _chanLive(_effStream(s, sd)) && String(firstToday(s[sd])?.id) === String(s.id)))));
  el.innerHTML = live.length ? `<div style="background:linear-gradient(135deg,rgba(220,38,38,.22),rgba(220,38,38,.06));border:1px solid rgba(220,38,38,.6);border-radius:12px;padding:.7rem 1rem;margin-bottom:1rem">
    ${live.map(s => `<div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;padding:.2rem 0">
      <span style="background:#dc2626;color:#fff;font-size:.68rem;font-weight:900;letter-spacing:1px;border-radius:4px;padding:.1rem .45rem;animation:livePulse 1.4s infinite">🔴 NA ŻYWO</span>
      ${teamLogo(s.team1, 22, '.5rem')}<b>${_h(s.team1)}</b><span style="color:var(--muted)">vs</span><b>${_h(s.team2)}</b>${teamLogo(s.team2, 22, '.5rem')}
      <span style="flex:1"></span>${_streamLinks(s) || '<span style="font-size:.72rem;color:var(--muted)">bez transmisji</span>'}
      ${_streamLinks(s) ? `<button class="btn btn-primary" style="font-size:.68rem;padding:.15rem .55rem" onclick="openMultistream('${s.id}')">📺 Oglądaj obie strony</button>` : ''}
    </div>`).join('')}
    ${live.filter(s => _streamLinks(s)).length > 1 ? `<div style="text-align:right;margin-top:.3rem"><button class="btn btn-ghost" style="font-size:.68rem;padding:.15rem .55rem" onclick="_ms.sel=null;openMultistream()">📺 Multistream — wszystkie mecze na żywo</button></div>` : ''}
  </div><style>@keyframes livePulse{0%,100%{opacity:1}50%{opacity:.55}}</style>` : '';
}
setInterval(() => { try { renderLiveBanner(); } catch(e) {} }, 60000);

// ═══ 🎬 AKCJE MECZU ══════════════════════════════════════════════
function _clipsFor(k) { return clipsList.filter(c => String(c.scheduleId) === String(k)); }
const _isDcClip = url => /^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/|^https:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/attachments\//i.test(String(url));
function playDcClip(){return __lz(5,'playDcClip',this,arguments)}
function _clipEmbed(){return __lz(5,'_clipEmbed',this,arguments)}
function _canUploadClip(){return __lz(5,'_canUploadClip',this,arguments)}
function uploadClip(){return __lz(5,'uploadClip',this,arguments)}

function _scoutTeam(){return __lz(5,'_scoutTeam',this,arguments)}
// 🏟️ CENTRUM MECZU — wszystko o meczu w jednym miejscu: przed (typy, transmisje, H2H, raport), po (wynik, mecze, MVP, opis AI, akcje)
// ⚡ SZYBKI PANEL ADMINA — wszystko, co czeka na decyzję, z akcjami w jednym miejscu (wygodny na telefonie)
function _adminTodo() {
  const sid = currentSeasonId || null, regs = (teamRegistrations || []).filter(r => !r.seasonId || !sid || r.seasonId === sid);
  return { results: (pendingResults || []), teams: regs.filter(r => r.status === 'pending'), pays: regs.filter(r => r.payment?.status === 'sent'), roster: regs.filter(r => (r.rosterRequests || []).some(q => q.status === 'pending')) };
}
function _adminTodoCount() { const t = _adminTodo(); return t.results.length + t.teams.length + t.pays.length + t.roster.length; }
function adminFabUpdate() {
  let b = document.getElementById('admin-fab'); if(!_isLoggedInSync()) { b?.remove(); return; }
  if(!b) { b = document.createElement('button'); b.id = 'admin-fab'; b.onclick = openAdminQuick; document.body.appendChild(b); }
  const n = _adminTodoCount(); b.innerHTML = `⚡${n ? `<span>${n}</span>` : ''}`; b.title = _g('Do zrobienia', 'To do'); b.classList.toggle('has', n > 0);
}
function openAdminQuick() {
  if(!_isLoggedInSync()) return; const t = _adminTodo(), en = currentLang === 'en', m = _fxModal('aq-modal', 620); m.classList.add('open');
  const sec = (ico, title, n, body, more) => `<div style="margin-bottom:.9rem"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.35rem"><b style="font-size:.86rem">${ico} ${title} ${n ? `<span style="background:#ef4444;color:#fff;border-radius:999px;padding:0 .45rem;font-size:.7rem">${n}</span>` : ''}</b>${more || ''}</div>${n ? body : `<div style="font-size:.76rem;color:var(--muted)">✅ ${_g('Nic do zrobienia', 'All clear')}</div>`}</div>`;
  const row = (txt, btns) => `<div style="display:flex;align-items:center;gap:.4rem;padding:.4rem .5rem;border:1px solid var(--border);border-radius:9px;margin-bottom:.3rem;font-size:.8rem;flex-wrap:wrap"><span style="flex:1;min-width:150px">${txt}</span>${btns}</div>`;
  const B = (lbl, on, cls = 'btn-ghost') => `<button class="btn ${cls}" style="font-size:.7rem;padding:.25rem .55rem" onclick="${on}">${lbl}</button>`;
  m.querySelector('.modal').innerHTML = _fxHead('aq-modal', '⚡ ' + _g('Do zrobienia', 'To do')) + `<div data-notr>
    ${sec('🏀', _g('Wyniki do zatwierdzenia', 'Results to approve'), t.results.length, t.results.slice(0, 6).map(p => row(`${_h(p.team1?.name || p.t1 || '?')} <b>${p.team1?.score ?? ''}:${p.team2?.score ?? ''}</b> ${_h(p.team2?.name || p.t2 || '?')}`, B(_g('Sprawdź', 'Review'), "_fxClose('aq-modal');openPendingResults()", 'btn-primary'))).join(''), t.results.length ? B(_g('wszystkie', 'all'), "_fxClose('aq-modal');openPendingResults()") : '')}
    ${sec('🧢', _g('Zgłoszenia drużyn', 'Team registrations'), t.teams.length, t.teams.map(r => row(`<b>${_h(r.teamName)}</b> <span style="color:var(--muted)">· ${(r.players || []).length} ${_g('graczy', 'players')}${r.payment?.status === 'paid' ? ' · 💶 ✓' : ''}</span>`, B('✅', `teamRegSetStatus('${r.id}','approved').then(()=>openAdminQuick())`, 'btn-primary') + B('✕', `teamRegSetStatus('${r.id}','rejected').then(()=>openAdminQuick())`))).join(''))}
    ${(() => { const dl = _signup().payDeadline, over = dl && dl < new Date().toISOString().slice(0, 10) ? _prTeams().filter(r => r.payment?.status !== 'sent') : []; return over.length ? `<div style="background:rgba(239,68,68,.1);border:1px solid #ef4444;border-radius:10px;padding:.55rem .7rem;margin-bottom:.9rem;font-size:.82rem">⛔ <b>${_g('Po terminie płatności', 'Past the payment deadline')} (${_h(payRemindDeadlineTxt(dl, currentLang === 'en'))})</b> — ${_g('nie zapłaciły', 'not paid')}: ${over.map(r => `<b>${_h(r.teamName)}</b>`).join(', ')}<div style="margin-top:.4rem;display:flex;gap:.4rem;flex-wrap:wrap"><button class="btn btn-ghost" style="font-size:.7rem" onclick="_fxClose('aq-modal');openPayments()">💳 ${_g('Płatności', 'Payments')}</button><button class="btn btn-ghost" style="font-size:.7rem" onclick="_fxClose('aq-modal');openDivisions()">🧩 ${_g('Dywizje', 'Divisions')}</button></div></div>` : ''; })()}
    ${_prTeams().filter(r => r.payment?.status !== 'sent').length ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.9rem;font-size:.82rem"><span>💶 ${_g('Nieopłacone drużyny', 'Unpaid teams')}: <b>${_prTeams().filter(r => r.payment?.status !== 'sent').length}</b></span><button class="btn btn-ghost" style="font-size:.7rem" onclick="_fxClose('aq-modal');openPayRemind()">📣 ${_g('Przypomnij', 'Remind')}</button></div>` : ''}
    ${sec('💶', _g('Płatności do sprawdzenia', 'Payments to check'), t.pays.length, t.pays.map(r => row(`<b>${_h(r.teamName)}</b>`, B('📷 ' + _g('zrzut', 'proof'), "_fxClose('aq-modal');openPayments()") + B('✅ ' + _g('opłacone', 'paid'), `payConfirm('${r.id}',true).then(()=>openAdminQuick())`, 'btn-primary'))).join(''))}
    ${sec('✏️', _g('Zmiany składu', 'Roster changes'), t.roster.length, t.roster.map(r => row(`<b>${_h(r.teamName)}</b> <span style="color:var(--muted)">· ${(r.rosterRequests || []).filter(q => q.status === 'pending').length} ${_g('prośba', 'request')}</span>`, B(_g('Otwórz', 'Open'), "_fxClose('aq-modal');goToTeamRegistrations();setRegTab('teams')", 'btn-primary'))).join(''))}
    <div style="font-size:.86rem;font-weight:700;margin-bottom:.3rem">🚦 ${_g('Gotowość drużyn', 'Team readiness')}</div>${_readinessAdminHtml()}</div>`;
}
// ✅ LISTA STARTOWA KAPITANA
function _teamSteps(r) {
  const sid = currentSeasonId || null, needFee = EU_MODE || !!(window._signupInfo?.fee), pl = r.players || [], my = String(discordUser?.id || '');
  const linked = pl.filter(p => p.discordId || (playersList || []).some(x => x.gamertag && _normNick(x.gamertag) === _normNick(p.gamertag))).length;
  const sch = (schedule || []).filter(s => (s.seasonId || null) === sid && [s.team1, s.team2].includes(r.teamName) && s.date);
  return [
    { k: 'reg', ok: true, t: _g('Zgłoszenie wysłane', 'Registration sent') },
    { k: 'appr', ok: r.status === 'approved', t: _g('Drużyna zatwierdzona przez admina', 'Team approved by an admin'), hint: _g('czeka na admina', 'waiting for an admin') },
    ...(needFee ? [{ k: 'pay', ok: r.payment?.status === 'paid', t: _g('Wpisowe opłacone', 'Entry fee paid'), hint: r.payment?.status === 'sent' ? _g('potwierdzenie wysłane — admin sprawdza', 'proof sent — admin is checking') : _signup().payDeadline ? _g('termin: ', 'deadline: ') + payRemindDeadlineTxt(_signup().payDeadline, currentLang === 'en') : '', act: `openTeamPayment('${r.id}')`, actL: '💶' }] : []),
    { k: 'roster', ok: pl.length >= 5, t: _g(`Skład: co najmniej 5 graczy (${pl.length})`, `Roster: at least 5 players (${pl.length})`), act: EU_MODE && !registrationsClosed ? `openEuTeamEdit('${r.id}')` : `openRosterChange('${r.id}')`, actL: '✏️' },
    { k: 'link', ok: linked >= Math.min(5, pl.length || 5), t: _g(`Gracze połączyli konta (${linked}/${pl.length})`, `Players linked their accounts (${linked}/${pl.length})`), hint: _g('każdy gracz: zaloguj się przez Discord → Mój panel → połącz nick', 'each player: log in with Discord → My panel → link your gamertag'), act: `navigator.clipboard?.writeText(location.origin + '/panel').then(()=>showToast('🔗 ' + _g('Skopiowano link dla graczy', 'Link for players copied'),'success'))`, actL: '🔗' },
    { k: 'logo', ok: !!r.logo, t: _g('Logo drużyny', 'Team logo'), act: `changeTeamLogo('${r.id}')`, actL: '🖼' },
    { k: 'media', ok: !!r.media?.at, t: _g('Media day: prezentacja drużyny', 'Media day: team intro'), act: `openMediaDay('${r.id}')`, actL: '🎬' },
    { k: 'game', ok: sch.length > 0, t: _g('Pierwszy mecz w terminarzu', 'First game scheduled'), act: `showView('schedule')`, actL: '🗓' }];
}
function captainChecklistHtml() {
  if(!discordUser) return ''; const sid = currentSeasonId || null, my = String(discordUser.id);
  const r = (teamRegistrations || []).find(x => String(x.captain?.id) === my && x.status !== 'rejected' && (!x.seasonId || !sid || x.seasonId === sid)); if(!r) return '';
  const S = _teamSteps(r), done = S.filter(x => x.ok).length; if(done === S.length) return '';
  return `<div class="card" id="cap-check" style="padding:.8rem 1rem;margin-bottom:1rem;border:1px solid var(--accent)" data-notr>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem"><b>✅ ${_g('Lista startowa', 'Starting checklist')} — ${_h(r.teamName)}</b><b style="color:var(--accent)">${done}/${S.length}</b></div>
    <div style="height:6px;background:var(--surface);border-radius:3px;overflow:hidden;margin-bottom:.5rem"><div style="height:100%;width:${Math.round(done / S.length * 100)}%;background:var(--accent)"></div></div>
    ${S.map(x => `<div style="display:flex;align-items:center;gap:.5rem;padding:.25rem 0;font-size:.82rem;${x.ok ? 'opacity:.6' : ''}"><span>${x.ok ? '✅' : '⬜'}</span><span style="flex:1">${x.t}${!x.ok && x.hint ? `<div style="font-size:.7rem;color:var(--muted)">${x.hint}</div>` : ''}</span>${!x.ok && x.act ? `<button class="btn btn-ghost" style="font-size:.7rem;padding:.15rem .5rem" onclick="${x.act}">${x.actL}</button>` : ''}</div>`).join('')}</div>`;
}
function _readinessAdminHtml() {
  const sid = currentSeasonId || null, regs = (teamRegistrations || []).filter(r => r.status !== 'rejected' && (!r.seasonId || !sid || r.seasonId === sid));
  if(!regs.length) return `<div style="font-size:.76rem;color:var(--muted)">${_g('Brak drużyn w sezonie', 'No teams this season')}</div>`;
  return regs.map(r => { const S = _teamSteps(r), d = S.filter(x => x.ok).length, miss = S.filter(x => !x.ok).map(x => x.t.replace(/\s*\(.*\)$/, ''));
    return `<div style="display:flex;gap:.5rem;align-items:center;padding:.3rem 0;border-top:1px solid var(--border);font-size:.78rem"><b style="min-width:120px">${_h(r.teamName)}</b><span style="color:${d === S.length ? 'var(--win)' : 'var(--accent)'};font-weight:800">${d}/${S.length}</span><span style="color:var(--muted);font-size:.7rem;flex:1">${miss.join(' · ') || '✅'}</span></div>`; }).join('');
}
// 📰 WĄTKI SEZONU — ciekawe historie z danych ligi (serie, rewanże, hity, forma graczy)
setTimeout(() => { try { const _sv = showView; showView = function(id, ...a) { const r = _sv.call(this, id, ...a); try { if(id === 'privacy') renderPrivacy(); if(id === 'howto') renderHowto(); _siteFooter(); } catch(e) {} return r; }; _siteFooter(); } catch(e) {} }, 0);
setTimeout(() => { try { const _rd = renderDashboard; renderDashboard = function(...a) { const r = _rd.apply(this, a); try { renderStories(); } catch(e) { console.warn('stories', e); } return r; }; } catch(e) {} }, 0);
function seasonStorylines() {
  const sid = currentSeasonId || null, ctx = _ssCtx(), en = currentLang === 'en', out = [], N = x => _normNick(x);
  const items = (schedule || []).filter(s => s.generated && (s.seasonId || null) === sid).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || (a.week || 0) - (b.week || 0));
  const seq = {}; items.forEach(s => { const r = _ssResult(ctx, s); if(!r?.done || !r.winnerSide) return; const w = s[r.winnerSide], l = s[r.winnerSide === 'team1' ? 'team2' : 'team1']; (seq[w] = seq[w] || []).push('W'); (seq[l] = seq[l] || []).push('L'); });
  const streak = (arr, c) => { let n = 0; for(let i = arr.length - 1; i >= 0 && arr[i] === c; i--) n++; return n; };
  Object.entries(seq).forEach(([t, a]) => { const w = streak(a, 'W'), l = streak(a, 'L'), losses = a.filter(x => x === 'L').length;
    if(a.length >= 4 && !losses) out.push({ p: 95, ico: '🛡️', t: _g(`<b>${_h(t)}</b> wciąż bez porażki (${a.length}-0) — kto ich zatrzyma?`, `<b>${_h(t)}</b> still unbeaten (${a.length}-0) — who can stop them?`) });
    else if(w >= 3) out.push({ p: 80 + w, ico: '🔥', t: _g(`<b>${_h(t)}</b>: ${w} wygranych z rzędu`, `<b>${_h(t)}</b>: ${w} wins in a row`) });
    if(l >= 3) out.push({ p: 60 + l, ico: '😬', t: _g(`<b>${_h(t)}</b> szuka przełamania — ${l} ${_plPL(l, 'porażka', 'porażki', 'porażek')} z rzędu`, `<b>${_h(t)}</b> looking to snap a ${l}-game skid`) }); });
  const ms = _withAllMatches(() => matches.filter(m => !m.walkover && (m.seasonId || null) === sid)).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const pg = {}; ms.forEach(m => [m.team1, m.team2].forEach(t => (t.players || []).forEach(p => (pg[N(p.name)] = pg[N(p.name)] || { name: p.name, team: t.name, g: [] }).g.push(+p.pts || 0))));
  Object.values(pg).forEach(x => { const last = x.g.slice(-3); if(last.length === 3 && last.every(v => v >= 20)) out.push({ p: 75 + Math.min(10, Math.round((last[0] + last[1] + last[2]) / 15)), ico: '🎯', t: _g(`<b>${_h(x.name)}</b> (${_h(x.team)}) w gazie: 3 mecze z rzędu po 20+ pkt (${last.join(', ')})`, `<b>${_h(x.name)}</b> (${_h(x.team)}) is on fire: 20+ in 3 straight games (${last.join(', ')})`) }); });
  const allPts = _withAllMatches(() => matches.filter(m => !m.walkover)).flatMap(m => [...(m.team1.players || []), ...(m.team2.players || [])].map(p => ({ n: p.name, v: +p.pts || 0 }))), rec = allPts.reduce((a, b) => b.v > a.v ? b : a, { v: 0 });
  const seasonBest = Object.values(pg).map(x => ({ name: x.name, v: Math.max(...x.g) })).sort((a, b) => b.v - a.v)[0];
  if(rec.v && seasonBest && seasonBest.v >= rec.v - 5 && N(seasonBest.name) !== N(rec.n)) out.push({ p: 70, ico: '📈', t: _g(`<b>${_h(seasonBest.name)}</b> blisko rekordu ligi: ${seasonBest.v} pkt (rekord: ${rec.v}, ${_h(rec.n)})`, `<b>${_h(seasonBest.name)}</b> is close to the league record: ${seasonBest.v} pts (record: ${rec.v}, ${_h(rec.n)})`) });
  const today = new Date().toISOString().slice(0, 10), table = Object.entries(seq).map(([t, a]) => ({ t, w: a.filter(x => x === 'W').length, g: a.length })).sort((a, b) => (b.w / (b.g || 1)) - (a.w / (a.g || 1)) || b.w - a.w), top2 = table.slice(0, 2).map(x => x.t);
  items.filter(s => s.date >= today && !_ssResult(ctx, s)?.done).slice(0, 12).forEach(s => {
    if(top2.length === 2 && top2.includes(s.team1) && top2.includes(s.team2)) out.push({ p: 90, ico: '⚔️', t: _g(`Hit kolejki: <b>${_h(s.team1)}</b> vs <b>${_h(s.team2)}</b> — starcie dwóch najlepszych drużyn`, `Game of the week: <b>${_h(s.team1)}</b> vs <b>${_h(s.team2)}</b> — the top two collide`), act: `openMatchCenter('${s.id}')` });
    const prev = ms.filter(m => [m.team1.name, m.team2.name].map(N).sort().join('|') === [s.team1, s.team2].map(N).sort().join('|')).pop();
    if(prev && Math.abs((+prev.team1.score || 0) - (+prev.team2.score || 0)) <= 3) out.push({ p: 72, ico: '🔁', t: _g(`Rewanż: <b>${_h(s.team1)}</b> vs <b>${_h(s.team2)}</b> — ostatnio ${prev.team1.score}:${prev.team2.score}`, `Rematch: <b>${_h(s.team1)}</b> vs <b>${_h(s.team2)}</b> — last time ${prev.team1.score}:${prev.team2.score}`), act: `openMatchCenter('${s.id}')` }); });
  const seen = new Set(); return out.sort((a, b) => b.p - a.p).filter(x => { const k = x.t.replace(/<[^>]+>/g, '').slice(0, 30); if(seen.has(k)) return false; seen.add(k); return true; }).slice(0, 5);
}
function renderStories() {
  let el = document.getElementById('dash-stories'); const ex = document.getElementById('dashboard-extras'); if(!ex) return;
  if(!el) { el = document.createElement('div'); el.id = 'dash-stories'; ex.parentNode.insertBefore(el, ex); }
  const L = seasonStorylines(), cap = captainChecklistHtml();
  try { renderLaunchTop(); } catch(e) {}
  el.innerHTML = launchHtml() + cap + (L.length ? `<div class="card" style="padding:.75rem 1rem;margin-bottom:1.5rem" data-notr><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem"><span style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted)">📰 ${_g('WĄTKI SEZONU', 'SEASON STORYLINES')}</span><a href="#" style="font-size:.72rem;color:var(--accent)" onclick="openMediaGallery();return false">🎬 ${_g('Poznaj drużyny', 'Meet the teams')}</a></div>
    ${L.map(x => `<div style="display:flex;gap:.55rem;align-items:flex-start;padding:.35rem 0;border-top:1px solid var(--border);font-size:.86rem;${x.act ? 'cursor:pointer' : ''}" ${x.act ? `onclick="${x.act}"` : ''}><span style="font-size:1.1rem">${x.ico}</span><span style="flex:1">${x.t}</span>${x.act ? '<span style="color:var(--accent);font-size:.75rem">›</span>' : ''}</div>`).join('')}</div>` : (_mdTeams().length ? `<div class="card" style="padding:.75rem 1rem;margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:center;gap:.6rem;flex-wrap:wrap" data-notr><div><b>🎬 ${_g('Poznaj drużyny', 'Meet the teams')}</b><div style="font-size:.76rem;color:var(--muted)">${_g('Prezentacje drużyn przed sezonem', 'Team intros before the season')} · ${_mdTeams().filter(r => r.media?.at).length}/${_mdTeams().length}</div></div><button class="btn btn-primary" style="font-size:.74rem" onclick="openMediaGallery()">${_g('Zobacz', 'View')}</button></div>` : ''));
  adminFabUpdate();
}

// 🎬 MEDIA DAY — prezentacja drużyny, galeria „Poznaj drużyny”, grafika, publikacja
const _MD_STYLES = [['run', '🏃 Szybki atak', '🏃 Run and gun'], ['def', '🛡️ Obrona', '🛡️ Defense first'], ['three', '🏹 Rzuty za 3', '🏹 Three-point shooting'], ['inside', '💪 Gra pod koszem', '💪 Inside game'], ['team', '🤝 Gra zespołowa', '🤝 Team basketball']];
function openMediaDay(){return __lz(5,'openMediaDay',this,arguments)}
function mediaDaySave(){return __lz(5,'mediaDaySave',this,arguments)}
function _mdTeams() { const sid = currentSeasonId || null; return (teamRegistrations || []).filter(r => r.status !== 'rejected' && (!r.seasonId || !sid || r.seasonId === sid)); }
function openMediaGallery(){return __lz(5,'openMediaGallery',this,arguments)}
function mediaDayImage(){return __lz(5,'mediaDayImage',this,arguments)}
function mediaDayPost(){return __lz(5,'mediaDayPost',this,arguments)}
function openInterview(){return __lz(5,'openInterview',this,arguments)}
function interviewSend(){return __lz(5,'interviewSend',this,arguments)}

// 🔗 POŁĄCZONE KONTA — PL i EU w jednym widoku
const _LINK_SRC = { PL: { url: 'https://kw5-elite-proxy.igor-bernakiewicz.workers.dev', site: 'https://chemikleagues.com' }, EU: { url: EU_WORKER, site: 'https://eu.chemikleagues.com' } };
function _linksFetch(){return __lz(5,'_linksFetch',this,arguments)}
function openLinkedAccounts(){return __lz(5,'openLinkedAccounts',this,arguments)}
function _linksCand(){return __lz(5,'_linksCand',this,arguments)}
function linksImport(){return __lz(5,'linksImport',this,arguments)}
function _linksDraw(){return __lz(5,'_linksDraw',this,arguments)}

function openMatchCenter(){return __lz(5,'openMatchCenter',this,arguments)}

function openScoutReport(){return __lz(5,'openScoutReport',this,arguments)}
function _scoutDraw(){return __lz(5,'_scoutDraw',this,arguments)}

function openClips(){return __lz(5,'openClips',this,arguments)}
function addClip(){return __lz(5,'addClip',this,arguments)}
function likeClip(){return __lz(5,'likeClip',this,arguments)}
function deleteClip(){return __lz(5,'deleteClip',this,arguments)}

// ═══ 👥 DOSTĘPNOŚĆ SKŁADU ═════════════════════════════════════════
function _teamPlayers(team, sid) {
  return playersList.filter(p => p.team && p.status === 'confirmed' && String(p.team).toLowerCase() === String(team).toLowerCase() && (!sid || !p.seasonId || p.seasonId === sid));
}
function _availOn(p, week, dowIdx) { const d = (p.weeks && p.weeks[week]) || p.days || []; return !!d[dowIdx]; }
function _availLine(team, s) {
  const ps = _teamPlayers(team, s.seasonId);
  if(!ps.length) return '';
  const cnt = i => ps.filter(p => _availOn(p, s.week, i)).length;
  return `<div title="Dostępność zgłoszona przez graczy w Moim panelu" style="font-size:.66rem;color:var(--muted);margin-top:.25rem">👥 Pn <b style="color:var(--text)">${cnt(0)}</b> · Śr <b style="color:var(--text)">${cnt(2)}</b> · Nd <b style="color:var(--text)">${cnt(6)}</b> <span>/ ${ps.length}</span></div>`;
}

// ═══ 👤 MÓJ PANEL ════════════════════════════════════════════════
function _myPlayerName() {
  if(myProfile?.gamertag && myProfile.status === 'confirmed') return myProfile.gamertag;
  if(typeof discordPsnMap !== 'undefined' && discordUser) return discordPsnMap[discordUser.discordTag] || discordPsnMap[discordUser.name] || discordPsnMap[discordUser.username] || null;
  return null;
}
function _myTeamName() {
  const sid = currentSeasonId || null;
  const cap = discordUser ? teamRegistrations.find(r => r.status === 'approved' && r.captain?.id === discordUser.id && (!sid || !r.seasonId || r.seasonId === sid)) : null;
  return cap?.teamName || (myProfile?.status === 'confirmed' ? myProfile.team : null) || null;
}
function _memberRequestsFor(team) {
  return playersList.filter(p => p.team && String(p.team).toLowerCase() === String(team).toLowerCase());
}
function decideMember(){return __lz(5,'decideMember',this,arguments)}
function _membersHtml(team, canDecide, from) {
  const list = _memberRequestsFor(team);
  if(!list.length) return '';
  const pend = list.filter(p => p.status === 'pending'), conf = list.filter(p => p.status === 'confirmed');
  const btn = (id, ok, label) => `<button class="btn ${ok ? 'btn-primary' : 'btn-ghost'}" style="font-size:.66rem;padding:.12rem .4rem" onclick="decideMember('${id}',${ok},'${from}')">${label}</button>`;
  return `${pend.length ? `<div style="font-size:.74rem;margin-top:.45rem"><b>⏳ Chcą dołączyć:</b> ${pend.map(p => `<span style="display:inline-flex;align-items:center;gap:.25rem;margin:.15rem .4rem .15rem 0">${_h(p.name)} <span style="color:var(--muted)">jako ${_h(p.gamertag)}</span>${canDecide ? btn(p.id, true, '✅') + btn(p.id, false, '❌') : ''}</span>`).join('')}</div>` : ''}
    ${conf.length ? `<div style="font-size:.74rem;margin-top:.3rem;color:var(--muted)">👥 Konta na stronie: ${conf.map(p => `<span style="margin-right:.4rem">${_h(p.name)} (${_h(p.gamertag || 'kapitan')})${canDecide && p.gamertag ? ' ' + btn(p.id, false, '✕') : ''}</span>`).join('')}</div>` : ''}`;
}

function openMyPanel(){return __lz(5,'openMyPanel',this,arguments)}

// Lista „Do zrobienia” (też dla licznika w zakładce)
function _myTodo() {
  if(!discordUser) return [];
  const sid = currentSeasonId || null;
  const team = _myTeamName();
  const isCaptain = !!(discordUser && teamRegistrations.some(r => r.status === 'approved' && r.captain?.id === discordUser.id));
  const items = schedule.filter(s => s.generated && (s.seasonId || null) === sid);
  const ctx = { demo: false };
  const todo = [];
  try {
    const pd = predictionsData[currentSeasonId];
    if(pd && pd.lockAt && !pd.locked && Date.now() < Date.parse(pd.lockAt) && !myPredictions[currentSeasonId])
      todo.push({ urgent: true, html: '🔮 Oddaj typy przedsezonowe (mistrz, MVP, debiutant…)', go: "showView('schedule');setTimeout(()=>document.querySelector('[id=season-schedule-wrap]')?.scrollIntoView({behavior:'smooth'}),200)" });
  } catch(e) {}
  // Fantasy: zapisany skład nie pasuje do pozycji PG/SG/SF/PF/C
  try {
    if(mySquad && fantasyData?.players?.length && typeof FX_SLOTS !== 'undefined') {
      const bad = FX_SLOTS.filter((x, i) => { const p = _fxP(mySquad.starters[i]); return p && !_fxElig(p, x); });
      if(bad.length || !mySquad.posRule) todo.push({ urgent: true, html: '🏀 Fantasy: ułóż piątkę po pozycjach (PG, SG, SF, PF, C)', go: "showView('fantasy')" });
    }
  } catch(e) {}
  if(team) {
    items.filter(s => [s.team1, s.team2].includes(team) && !s.date && !_ssResult(ctx, s)).forEach(s => {
      const side = s.team1 === team ? 'team1' : 'team2';
      if(isCaptain && !scheduleDayPicks[String(s.id)]?.[side]) todo.push({ urgent: true, html: `📅 Wybierz termin: vs <b>${_h(s[side === 'team1' ? 'team2' : 'team1'])}</b> (Week ${s.week})`, go: `showView('schedule');_ssWeek=${s.week};renderSchedule()` });
    });
    if(isCaptain) {
      const nowMs = Date.now();
      items.filter(s => [s.team1, s.team2].includes(team) && s.date).forEach(s => {
        const w = _matchWindow(s);
        if(!w || nowMs < w.start + 30 * 60e3) return; // jeszcze przed / w trakcie meczu
        const linked = _ssResult(ctx, s)?.games.length || 0;
        const pend = pendingResults.filter(p => String(p.scheduleId) === String(s.id)).length;
        if(linked + pend >= (s.bestOf || 1)) return;
        todo.push({ urgent: true, html: `📸 Zgłoś wynik: vs <b>${_h(s.team1 === team ? s.team2 : s.team1)}</b> (Week ${s.week}${(s.bestOf || 1) > 1 ? ` · mecz ${linked + pend + 1}/${s.bestOf}` : ''})`,
          go: `showView('schedule');_ssWeek=${s.week};renderSchedule();setTimeout(()=>openReportResult('${s.id}'),200)` });
      });
    }
    pendingResults.filter(p => { const s = items.find(x => String(x.id) === String(p.scheduleId)); return s && [s.team1, s.team2].includes(team) && s[p.side] !== team; })
      .forEach(p => { const s = items.find(x => String(x.id) === String(p.scheduleId));
        todo.push({ urgent: true, html: `📸 Potwierdź wynik: ${_h(p.matchData.team1.name)} ${p.matchData.team1.score}:${p.matchData.team2.score} ${_h(p.matchData.team2.name)}`, go: `showView('schedule');_ssWeek=${s?.week || 1};renderSchedule()` }); });
  }
  if(isCaptain && team) _memberRequestsFor(team).filter(p => p.status === 'pending').forEach(p => todo.push({ urgent: true, html: `👤 <b>${_h(p.name)}</b> chce dołączyć jako ${_h(p.gamertag)}`, go: `openTeamRoster('${String(team).replace(/'/g, "\\'")}','g')` }));
  awardsList.filter(a => a.status === 'open' && a.categories.some(c => !myAwardVotes[a.id]?.[c.key])).forEach(a => todo.push({ urgent: true, html: `🗳 Zagłosuj: <b>${_h(a.title)}</b>`, go: `showView('dashboard');setTimeout(()=>document.getElementById('awards-dashboard-wrap')?.scrollIntoView({behavior:'smooth'}),200)` }));
  const openVotes = items.filter(s => !_voteClosedClient(s) && !myVotes[String(s.id)] && !_ssResult(ctx, s)).length;
  if(openVotes) todo.push({ urgent: false, html: `🎯 Wytypuj zwycięzców: ${openVotes} ${_plPL(openVotes, 'mecz czeka', 'mecze czekają', 'meczów czeka')} na Twój typ`, go: `showView('schedule')` });
  const po = typeof getActivePlayoff === 'function' ? getActivePlayoff() : null;
  if(po && _bracketReady(po) && !bracketData[String(po.id)]?.locked && !myBracket[String(po.id)]) todo.push({ urgent: true, html: '🏆 Wypełnij drabinkę w Typerze playoffów', go: 'openBracketPicker()' });
  // ☀️ NA DZIŚ — codzienne zabawy
  try { if(window._cardsCanOpen) todo.push({ daily: true, html: currentLang === 'en' ? '🎁 Open today\u2019s card pack' : '🎁 Otwórz dzisiejszą paczkę kart', go: "showView('cards')" }); } catch(e) {}
  try { if(_streak && _streak.streak >= 1 && !_streak.todayDone) todo.push({ daily: true, html: currentLang === 'en' ? `🔥 Keep your ${_streak.streak}-day streak — do anything today` : `🔥 Utrzymaj serię ${_streak.streak} ${_plPL(_streak.streak, 'dnia', 'dni', 'dni')} — zrób dziś cokolwiek`, go: "showView('cards')" }); } catch(e) {}
  try { if(_karnetClaimable()) todo.push({ daily: true, html: currentLang === 'en' ? '🎟️ Claim your Weekly pass reward' : '🎟️ Odbierz nagrodę z Karnetu tygodnia', go: "showView('mypanel')" }); } catch(e) {}
  try { if(_kPool().length && !_kState().done) todo.push({ daily: true, html: currentLang === 'en' ? '🧩 Solve today\u2019s 2Kordle' : '🧩 Rozwiąż dzisiejsze 2Kordle', go: "showView('kordle')" }); } catch(e) {}
  try {
    const td = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' }), tm = new Date(Date.now() + 864e5).toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' });
    const soon = items.filter(s => s.date && (s.date === td || s.date === tm) && !_voteClosedClient(s) && !myVotes[String(s.id)] && !_ssResult(ctx, s)).length;
    if(soon) todo.push({ daily: true, html: currentLang === 'en' ? `🎯 Pick today\u2019s / tomorrow\u2019s games (${soon})` : `🎯 Wytypuj dzisiejsze i jutrzejsze mecze (${soon})`, go: "showView('schedule')" });
  } catch(e) {}
  try { const cr = isCaptain ? teamRegistrations.find(r => r.status === 'approved' && r.captain?.id === discordUser.id) : null; if(cr && !cr.xHandle) todo.push({ urgent: false, html: currentLang === 'en' ? '🐦 Add your team\u2019s X profile' : '🐦 Podaj profil X drużyny', go: `openTeamXModal('${cr.id}')` }); } catch(e) {}
  if(!myProfile || !myProfile.team) todo.push({ urgent: false, html: '🔗 Połącz konto z drużyną (niżej)', go: `document.getElementById('me-profile-box')?.scrollIntoView({behavior:'smooth'})` });
  else if(!myProfile.days?.some(Boolean)) todo.push({ urgent: false, html: '👥 Ustaw swoją dostępność (niżej)', go: `document.getElementById('me-profile-box')?.scrollIntoView({behavior:'smooth'})` });
  return todo;
}
function updateMyPanelBadge() {
  setTimeout(() => { try { if(document.body.classList.contains('side-on')) renderSideNav(); } catch(e) {} }, 0);
  const el = document.getElementById('mypanel-badge');
  if(!el) return;
  const n = discordUser ? _myTodo().filter(t => t.urgent || t.daily).length : 0;
  el.textContent = n; el.style.display = n ? 'inline-block' : 'none';
  const bn = document.getElementById('bn-badge');
  if(bn) { bn.textContent = n; bn.style.display = n ? 'inline-block' : 'none'; }
}


// ═══ 📊 MÓJ PANEL — moje statystyki i statystyki drużyny ═══
let _mpScope = 'season'; // season | edition | career
function _mpMatches(scope) {
  const sc = scope || _mpScope;
  const all = _withAllMatches(() => matches.slice()).filter(m => !m.walkover);
  if(sc === 'career') return all;
  if(sc === 'edition') { const ed = _editionOf(currentSeasonId); return all.filter(m => _editionOf(m.seasonId) === ed); }
  return all.filter(m => (m.seasonId || null) === (currentSeasonId || null));
}
function _mpSame(a, b) {
  const cf = v => _normNick(v).replace(/[i1]/g, 'l').replace(/0/g, 'o'); // „Il morgan Il” = „llmorganll”
  const x = cf(a), y = cf(b);
  return !!x && (x === y || (x.length >= 5 && y.length >= 5 && _lev(x, y) <= 1));
}
// zbiera występy: { name(najczęstsza pisownia), team, games:[{date,opp,won,pts,...}] }
function _mpAgg(filterFn, scope) {
  const by = {};
  _mpMatches(scope).forEach(m => [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, o]) => {
    if(!filterFn(t)) return;
    const won = (+t.score || 0) > (+o.score || 0);
    (t.players || []).forEach(p => {
      const k = _normNick(p.name); if(!k) return;
      const e = by[k] = by[k] || { names: {}, team: t.name, games: [] };
      e.names[p.name] = (e.names[p.name] || 0) + 1;
      e.games.push({ id: m.id, date: m.date, opp: o.name, won, pos: p.pos || '', pts: p.pts || 0, reb: p.reb || 0, ast: p.ast || 0, stl: p.stl || 0, blk: p.blk || 0, to: p.to || 0,
        fgm: p.fgm || 0, fga: p.fga || 0, tpm: p.tpm || 0, tpa: p.tpa || 0, ftm: p.ftm || 0, fta: p.fta || 0, grade: p.grade || '' });
    });
  }));
  return Object.entries(by).map(([k, e]) => {
    const g = e.games, n = g.length, sum = f => g.reduce((s, x) => s + x[f], 0);
    const pct = (a, b) => sum(b) ? Math.round(sum(a) / sum(b) * 100) : null;
    const grades = g.filter(x => x.grade);
    return { key: k, name: Object.entries(e.names).sort((a, b) => b[1] - a[1])[0][0], team: e.team, games: g, gp: n,
      w: g.filter(x => x.won).length, ppg: sum('pts') / n, rpg: sum('reb') / n, apg: sum('ast') / n, spg: sum('stl') / n, bpg: sum('blk') / n, tpg: sum('to') / n,
      fg: pct('fgm', 'fga'), tp: pct('tpm', 'tpa'), ft: pct('ftm', 'fta'),
      grade: grades.length ? numToGrade(grades.reduce((s, x) => s + gradeToNum(x.grade), 0) / grades.length) : '—',
      best: [...g].sort((a, b) => b.pts - a.pts)[0],
      pos: (() => { const c = {}; g.forEach(x => { if(x.pos) c[x.pos] = (c[x.pos] || 0) + 1; }); return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] || ''; })() };
  });
}
function _mpStatsHtml(){return __lz(5,'_mpStatsHtml',this,arguments)}


// ═══ 🏀 DRUŻYNY I SKŁADY (wszystkie drużyny sezonu w jednym miejscu) ═══
let _tv = { q: '', sort: 'table', scope: 'season' };
function renderTeamsView(){return __lz(5,'renderTeamsView',this,arguments)}


function _myCaptainReg(){return __lz(5,'_myCaptainReg',this,arguments)}
function _needFee() { const s = _signup(); return EU_MODE || !!s.fee || !!s.skrillEmail || !!s.revolutUrl; }
function _teamEditBtn(r, small) { const st = small ? 'font-size:.7rem;padding:.25rem .5rem' : 'font-size:.78rem';
  return !registrationsClosed && EU_MODE ? `<button class="btn btn-ghost" style="${st}" onclick="openEuTeamEdit('${r.id}')">✏️ ${_g('Edytuj drużynę', 'Edit team')}</button>`
    : `<button class="btn btn-ghost" style="${st}" onclick="openRosterChange('${r.id}')">✏️ ${_g('Zmiana składu', 'Roster change')}</button>`; }
function captainBoxHtml(){return __lz(5,'captainBoxHtml',this,arguments)}

// 🚀 START LIGI — odliczanie, typy i przedsezonowy ranking na dashboardzie + panel admina
function _launchTarget(c) { if(!c?.on) return null; const t = c.mode === 'signups' ? c.signupsEnd : c.mode === 'custom' ? c.customAt : c.seasonStart; return t ? Date.parse(t) : null; }
function _launchLabel(c) { return c.mode === 'signups' ? _g('Zapisy kończą się za', 'Registrations close in') : c.mode === 'custom' ? (c.customLabel || _g('Zostało', 'Time left')) : _g('Start sezonu za', 'Season starts in'); }
function _cdParts(ms) { const s = Math.max(0, Math.floor(ms / 1000)); return [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60]; }
function renderLaunchTop() { // ⏳ odliczanie — pierwszy element dashboardu
  const v = document.getElementById('view-dashboard'); if(!v) return; let el = document.getElementById('launch-top');
  if(!el) { el = document.createElement('div'); el.id = 'launch-top'; v.insertBefore(el, v.firstChild); } else if(v.firstChild !== el) v.insertBefore(el, v.firstChild);
  el.innerHTML = launchCountdownHtml();
}
function launchCountdownHtml() {
  const L = window._launch || {}, c = L.countdown, t = _launchTarget(c); let out = '';
  if(t && t > Date.now()) { const [d, h, m, s] = _cdParts(t - Date.now()), box = (v, l, id) => `<div style="min-width:64px;background:rgba(0,0,0,.25);border-radius:10px;padding:.45rem .5rem;text-align:center"><div id="${id}" style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2rem;line-height:1">${String(v).padStart(2, '0')}</div><div style="font-size:.6rem;letter-spacing:1px;opacity:.8">${l}</div></div>`;
    out += `<div class="card" id="launch-cd" data-t="${t}" style="padding:1rem 1.1rem;margin-bottom:1rem;background:linear-gradient(135deg,rgba(245,197,24,.22),rgba(245,197,24,.04));border:1px solid var(--accent)" data-notr>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap"><div><div style="font-size:.72rem;font-weight:800;letter-spacing:1.5px;color:var(--accent)">⏳ ${_h(_launchLabel(c)).toUpperCase()}</div>
        <div style="font-size:.82rem;color:var(--muted);margin-top:.15rem">${new Date(t).toLocaleString(currentLang === 'en' ? 'en-GB' : 'pl-PL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div></div>
        <div style="display:flex;gap:.4rem">${box(d, _g('DNI', 'DAYS'), 'cd-d')}${box(h, _g('GODZ', 'HRS'), 'cd-h')}${box(m, 'MIN', 'cd-m')}${box(s, 'SEK'.replace('SEK', _g('SEK', 'SEC')), 'cd-s')}</div></div>
      ${c.mode === 'signups' && !registrationsClosed ? `<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.7rem"><button class="btn btn-primary" style="font-size:.76rem" onclick="goToTeamRegistrations()">🧢 ${_g('Zapisz drużynę', 'Register your team')}</button><button class="btn btn-ghost" style="font-size:.76rem" onclick="showView('howto')">📖 ${_g('Jak to działa', 'How it works')}</button></div>` : ''}</div>`;
    clearInterval(window._cdT); window._cdT = setInterval(() => { const el = document.getElementById('launch-cd'); if(!el) return clearInterval(window._cdT); const left = +el.dataset.t - Date.now(); if(left <= 0) { clearInterval(window._cdT); try { renderLaunchTop(); } catch(e) {} return; } const [d2, h2, m2, s2] = _cdParts(left); [['cd-d', d2], ['cd-h', h2], ['cd-m', m2], ['cd-s', s2]].forEach(([id, v]) => { const x = document.getElementById(id); if(x) x.textContent = String(v).padStart(2, '0'); }); }, 1000);
  }
  return out;
}
function launchHtml() { // dywizje, typy i przedsezonowy ranking (w bloku wątków sezonu)
  const L = window._launch || {}; let out = divisionsHtml();
  if(L.picks?.on) { try { const ctx = { demo: false, seasonId: currentSeasonId || null }, pc = _predCardHtml(ctx); if(pc) out += `<div id="launch-picks">${pc}</div>`; } catch(e) {} }
  if(L.pre?.on && L.pre.items?.length && !_seasonMatchesOf(currentSeasonId || null).length) { const med = ['🥇', '🥈', '🥉'];
    out += `<div class="card" style="padding:.8rem 1rem;margin-bottom:1rem" data-notr><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">📊 ${_g('PRZEDSEZONOWY POWER RANKING', 'PRE-SEASON POWER RANKING')}</div>
      ${L.pre.items.map((x, i) => `<div style="display:flex;gap:.6rem;align-items:flex-start;padding:.4rem 0;border-top:1px solid var(--border)"><b style="min-width:30px;font-family:'Barlow Condensed',sans-serif;font-size:1.15rem">${med[i] || '#' + (i + 1)}</b>${teamLogo(x.team, 30, '.8rem')}<div style="flex:1"><b>${_h(x.team)}</b>${x.comment ? `<div style="font-size:.8rem;color:var(--muted)">${_h(x.comment)}</div>` : ''}</div></div>`).join('')}</div>`; }
  return out;
}
// panel admina „🚀 Start ligi”
let _ln = null;
function _dtLocal(){return __lz(5,'_dtLocal',this,arguments)}
function openLaunch(){return __lz(5,'openLaunch',this,arguments)}
function _lnDraw(){return __lz(5,'_lnDraw',this,arguments)}
function lnMove(){return __lz(5,'lnMove',this,arguments)}
function lnRankAi(){return __lz(5,'lnRankAi',this,arguments)}
function lnSave(){return __lz(5,'lnSave',this,arguments)}
function lnPublish(){return __lz(5,'lnPublish',this,arguments)}
function _pg(){return __lz(5,'_pg',this,arguments)}
function _pgH(){return __lz(5,'_pgH',this,arguments)}
function renderPrivacy(){return __lz(5,'renderPrivacy',this,arguments)}
function renderHowto(){return __lz(5,'renderHowto',this,arguments)}
function deleteMyData(){return __lz(5,'deleteMyData',this,arguments)}
function _siteFooter() { if(document.getElementById('site-footer')) return; const v = document.querySelector('.view'); if(!v?.parentNode) return; const f = document.createElement('div'); f.id = 'site-footer';
  f.style.cssText = 'text-align:center;font-size:.76rem;color:var(--muted);padding:1.6rem .5rem 2.2rem;opacity:.85';
  f.innerHTML = `<a href="#" onclick="showView('howto');return false" style="color:inherit">📖 ${_g('Jak to działa', 'How it works')}</a> · <a href="#" onclick="showView('rules');return false" style="color:inherit">📜 ${_g('Regulamin', 'Rules')}</a> · <a href="#" onclick="showView('privacy');return false" style="color:inherit">🔒 ${_g('Prywatność', 'Privacy')}</a>`;
  v.parentNode.appendChild(f); }

// 🧩 DYWIZJE — podział drużyn (auto: najsilniejsze do D1 / wyrównany „wąż”), ręczne poprawki, generator terminarza, publikacja i grafika
let _dv = null;
function _teamStrength(){return __lz(5,'_teamStrength',this,arguments)} function _dvTeams(){return __lz(5,'_dvTeams',this,arguments)}
const _dvPaid = r => r.status === 'approved' || r.payment?.status === 'paid';
function openDivisions(){return __lz(5,'openDivisions',this,arguments)}
function _dvAuto(){return __lz(5,'_dvAuto',this,arguments)}
function _dvDraw(){return __lz(5,'_dvDraw',this,arguments)}
function _dvCount(){return __lz(5,'_dvCount',this,arguments)}
function _dvGroups(){return __lz(5,'_dvGroups',this,arguments)}
function dvSave(){return __lz(5,'dvSave',this,arguments)}
function dvPublish(){return __lz(5,'dvPublish',this,arguments)}
function dvToFixture(){return __lz(5,'dvToFixture',this,arguments)}
function dvImage(){return __lz(5,'dvImage',this,arguments)}
function divisionsHtml() { // dashboard: opublikowane dywizje
  const D = window._launch?.divisions; if(!D?.groups?.length || (D.seasonId && currentSeasonId && D.seasonId !== currentSeasonId)) return '';
  return `<div class="card" style="padding:.8rem 1rem;margin-bottom:1rem" data-notr><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.5rem">🧩 ${_g('DYWIZJE SEZONU', 'THE DIVISIONS')}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.7rem">${D.groups.map(g => `<div><div style="font-weight:900;font-family:'Barlow Condensed',sans-serif;font-size:1.15rem;color:var(--accent);margin-bottom:.3rem">${_h(g.name)}</div>${g.teams.map(t => `<div style="display:flex;align-items:center;gap:.45rem;padding:.2rem 0;font-size:.86rem">${teamLogo(t, 24, '.6rem')}${_h(t)}</div>`).join('')}</div>`).join('')}</div></div>`;
}
// 🔮 typy: „mistrz dywizji” dla każdej opublikowanej dywizji
function _predDefs(sid) { sid = sid || currentSeasonId || null; const D = window._launch?.divisions;
  if(D?.groups?.length >= 2 && (!D.seasonId || D.seasonId === sid)) return [...D.groups.map(g => ({ k: 'champion_' + g.id, icon: '🏆', label: _g('Mistrz: ', 'Champion: ') + g.name, type: 'team', pts: 5, teams: [...g.teams].sort((a, b) => a.localeCompare(b, 'pl')) })), ...PRED_DEF.filter(d => ['mvp', 'roy', 'scorer'].includes(d.k))];
  return PRED_DEF; }

function _dvCfgHtml(){return __lz(5,'_dvCfgHtml',this,arguments)}
function dvCfgSave(){return __lz(5,'dvCfgSave',this,arguments)}
function _zoneOf(groupName, idx, n) { // strefa w tabeli: ▲ awans / 🟡 playoffy / ▼ spadek
  const D = window._launch?.divisions; if(!D?.groups) return null; const g = D.groups.find(x => x.name === groupName); const z = g && D.zones?.[g.id]; if(!z) return null;
  if(z.up && idx < z.up) return { c: '#22c55e', t: _g('Awans', 'Promotion') }; if(z.po && idx < z.po) return { c: '#f5c518', t: _g('Playoffy', 'Playoffs') }; if(z.down && idx >= n - z.down) return { c: '#ef4444', t: _g('Spadek', 'Relegation') }; return null;
}
function _zoneMark(rowHtml, z) { if(!z) return rowHtml; const i = rowHtml.indexOf('<td'), j = i >= 0 ? rowHtml.indexOf('>', i) : -1; if(j < 0) return rowHtml;
  return rowHtml.slice(0, j + 1) + `<span title="${_h(z.t)}" style="display:inline-block;width:4px;height:1.15em;border-radius:2px;background:${z.c};margin-right:7px;vertical-align:middle"></span>` + rowHtml.slice(j + 1); }
function _zoneLegend(groupName) { const D = window._launch?.divisions, g = D?.groups?.find(x => x.name === groupName), z = g && D.zones?.[g.id]; if(!z || !(z.up || z.po || z.down)) return '';
  const it = (c, t) => `<span style="display:inline-flex;align-items:center;gap:.3rem;margin-right:.9rem"><span style="width:10px;height:10px;border-radius:2px;background:${c}"></span>${t}</span>`;
  return `<span style="float:right;font-family:inherit;font-weight:600;font-size:.7rem;letter-spacing:0;color:var(--muted)">${z.up ? it('#22c55e', _g('awans', 'promotion') + ` (${z.up})`) : ''}${z.po ? it('#f5c518', _g('playoffy', 'playoffs') + ` (${z.po})`) : ''}${z.down ? it('#ef4444', _g('spadek', 'relegation') + ` (${z.down})`) : ''}</span>`; }
function _prGroups(pr) { const gs = [...new Set((pr.entries || []).map(e => e.group || ''))]; return gs.length > 1 || gs[0] ? gs.map(g => [g, pr.entries.filter(e => (e.group || '') === g)]) : [['', pr.entries]]; }
function _dvCur() { const D = window._launch?.divisions; return D?.groups?.length >= 2 && (!D.seasonId || !currentSeasonId || D.seasonId === currentSeasonId) ? D.groups : null; }

function renderMyPanelView(){return __lz(5,'renderMyPanelView',this,arguments)}
function _meFillRoster(){return __lz(5,'_meFillRoster',this,arguments)}
function saveMyProfile(){return __lz(5,'saveMyProfile',this,arguments)}

function _shareCardCanvas(){return __lz(6,'_shareCardCanvas',this,arguments)}
function openShareCard(){return __lz(6,'openShareCard',this,arguments)}

// ═══ ✏️ ZMIANY SKŁADU ════════════════════════════════════════════
function _rosterBlock(r) {
  const isAdmin = _isLoggedInSync();
  const isCap = discordUser && r.captain?.id === discordUser.id && r.status === 'approved';
  const membersHtml = r.status === 'approved' && (isAdmin || isCap) ? _membersHtml(r.teamName, true, 'card') +
    `<button class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .55rem;margin:.45rem .35rem 0 0" onclick="openTeamRoster(this.dataset.t, 'g')" data-t="${_h(r.teamName)}">👥 Skład i dostępność</button>` +
    `<button class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .55rem;margin:.45rem .35rem 0 0" onclick="changeTeamLogo('${r.id}')">🖼 Zmień logo</button>` : r.status === 'pending' && (isAdmin || (discordUser && r.captain?.id === discordUser.id)) ? `<button class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .55rem;margin:.45rem .35rem 0 0" onclick="changeTeamLogo('${r.id}')">🖼 ${r.logo ? _g('Zmień logo', 'Change logo') : _g('Dodaj logo', 'Add logo')}</button>` : ''; // drużyna oczekująca: logo może dodać admin i kapitan
  const pend = (r.rosterRequests || []).filter(q => q.status === 'pending');
  const locked = rosterLockDate && _today() > rosterLockDate;
  let html = pend.map(q => `<div style="margin-top:.5rem;font-size:.76rem;background:rgba(245,197,24,.07);border:1px dashed var(--accent);border-radius:8px;padding:.45rem .6rem">
    ⏳ <b>Prośba o zmianę składu</b>: ${q.add.length ? '➕ ' + q.add.map(p => _h(p.gamertag)).join(', ') : ''} ${q.remove.length ? '➖ ' + q.remove.map(_h).join(', ') : ''} ${(q.rename || []).length ? '✏️ ' + q.rename.map(x => _h(x.from) + ' → ' + _h(x.to)).join(', ') : ''}
    ${q.note ? `<div style="color:var(--muted)">${_h(q.note)}</div>` : ''}
    ${isAdmin ? `<div style="display:flex;gap:.3rem;margin-top:.35rem"><button class="btn btn-primary" style="font-size:.7rem;padding:.2rem .5rem" onclick="decideRoster('${r.id}','${q.id}',true)">✅ Zatwierdź</button>
      <button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .5rem" onclick="decideRoster('${r.id}','${q.id}',false)">❌ Odrzuć</button></div>` : ''}
  </div>`).join('');
  if(isCap && !pend.length) html += `<button class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .55rem;margin-top:.5rem" onclick="openRosterChange('${r.id}')">✏️ ${locked ? 'Popraw nicki (okno transferowe zamknięte)' : 'Zmień skład / popraw nicki'}</button>`;
  return membersHtml + html;
}
// 🧢 EU: skład zgłoszonej drużyny (na stronie głównej) + ✏️ edycja przez kapitana, dopóki zapisy są otwarte
const _platIcon = p => p === 'xbox' ? '<span title="Xbox" style="color:#16a34a">Ⓧ</span>' : '<span title="PlayStation" style="color:#3b82f6">Ⓟ</span>';
function _euRosterHtml(r) {
  return `<div style="margin-top:.5rem;border-top:1px solid var(--border);padding-top:.4rem;display:flex;flex-direction:column;gap:.15rem">
    ${(r.players || []).map(p => `<div style="display:flex;justify-content:space-between;gap:.4rem;font-size:.76rem"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_platIcon(p.platform)} ${_h(p.gamertag)}</span>${p.x ? `<a href="https://x.com/${_h(p.x)}" target="_blank" rel="noopener" style="color:var(--muted);font-size:.7rem">𝕏</a>` : ''}</div>`).join('')}
    ${r.captain?.name ? `<div style="font-size:.7rem;color:var(--muted);margin-top:.15rem">👑 Captain: ${_h(r.captain.name)}</div>` : ''}
    ${discordUser && String(r.captain?.id) === String(discordUser.id) ? `<div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.35rem">${r.payment?.status !== 'paid' && r.payment?.status !== 'sent' && _needFee() ? `<button class="btn btn-primary" style="font-size:.7rem;padding:.25rem .5rem" onclick="openTeamPayment('${r.id}')">💶 ${_g('Zapłać wpisowe', 'Pay entry fee')}</button>` : ''}${_teamEditBtn(r, true)}</div>` : ''}</div>`;
}
let _euEd = null;
function openEuTeamEdit(){return __lz(6,'openEuTeamEdit',this,arguments)}
function _euEdDraw(){return __lz(6,'_euEdDraw',this,arguments)}
function saveEuTeamEdit(){return __lz(6,'saveEuTeamEdit',this,arguments)}

function openRosterChange(){return __lz(6,'openRosterChange',this,arguments)}
function sendRosterChange(){return __lz(6,'sendRosterChange',this,arguments)}

function openRosterEditor(){return __lz(6,'openRosterEditor',this,arguments)}
function _renderRosterEditor(){return __lz(6,'_renderRosterEditor',this,arguments)}
function saveRosterEditor(){return __lz(6,'saveRosterEditor',this,arguments)}

function decideRoster(){return __lz(6,'decideRoster',this,arguments)}
function saveRosterLock(){return __lz(6,'saveRosterLock',this,arguments)}

// ═══ 🔮 SCENARIUSZE AWANSU ═══════════════════════════════════════
function _seasonPoints(sid) {
  const t = {};
  const add = n => (t[n] = t[n] || { team: n, pts: 0, w: 0, l: 0, gp: 0 });
  _seasonMatchesOf(sid).filter(m => !_isAnyPlayoffMatch(m)).forEach(m => {
    const w1 = (m.team1.score || 0) > (m.team2.score || 0);
    const W = add(w1 ? m.team1.name : m.team2.name), L = add(w1 ? m.team2.name : m.team1.name);
    W.w++; W.gp++; W.pts += 2; L.l++; L.gp++; L.pts += m.walkover ? 0 : 1;
  });
  _penaltiesFor(sid).forEach(p => { add(p.team).pts -= p.points; });
  return t;
}
function renderScenarios() {
  const el = document.getElementById('scenario-wrap');
  if(!el) return;
  const sid = currentSeasonId || null;
  const season = seasons.find(x => x.id === sid), fx = season?.fixture;
  const items = schedule.filter(s => s.generated && s.seasonId === sid);
  if(!fx || !items.length) { el.innerHTML = ''; return; }
  const ctx = { demo: false };
  const remaining = [];
  items.forEach(s => { const left = (s.bestOf || 1) - (_ssResult(ctx, s)?.games.length || 0); for(let i = 0; i < left; i++) remaining.push(s); });
  const played = items.some(s => _ssResult(ctx, s));
  if(!played || !remaining.length) { el.innerHTML = ''; return; }
  const groups = fx.format === 'groups' && fx.groups?.length ? fx.groups.map(g => ({ name: g.name, teams: g.teams })) : [{ name: '', teams: [...new Set(items.flatMap(s => [s.team1, s.team2]))] }];
  const spots = fx.playoffSpots || (groups.length > 1 ? 2 : Math.min(4, groups[0].teams.length - 1));
  const base = _seasonPoints(sid);
  const pts0 = n => base[n]?.pts || 0;
  const remBy = n => remaining.filter(s => s.team1 === n || s.team2 === n).length;
  const sims = 2000, made = {};
  const probs = remaining.map(s => _eloProb(s.team1, s.team2));
  for(let k = 0; k < sims; k++) {
    const p = {};
    groups.forEach(g => g.teams.forEach(n => { p[n] = pts0(n) + Math.random() * 0.01; }));
    remaining.forEach((s, i) => { const w1 = Math.random() < probs[i]; if(p[s.team1] !== undefined) p[s.team1] += w1 ? 2 : 1; if(p[s.team2] !== undefined) p[s.team2] += w1 ? 1 : 2; });
    groups.forEach(g => [...g.teams].sort((a, b) => p[b] - p[a]).slice(0, spots).forEach(n => { made[n] = (made[n] || 0) + 1; }));
  }
  const isAdmin = _isLoggedInSync();
  const rows = groups.map(g => {
    const list = g.teams.map(n => ({ n, now: pts0(n), max: pts0(n) + 2 * remBy(n), min: pts0(n) + remBy(n), pct: Math.round((made[n] || 0) / sims * 100) }));
    list.forEach(x => {
      const others = list.filter(o => o !== x);
      x.clinched = others.filter(o => o.max >= x.min).length < spots;
      x.out = others.filter(o => o.min > x.max).length >= spots;
    });
    list.sort((a, b) => b.pct - a.pct || b.now - a.now);
    return (g.name ? `<div style="padding:.4rem .9rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;color:var(--accent);background:var(--surface2)">${_h(g.name)}</div>` : '') +
      list.map(x => `<div style="display:grid;grid-template-columns:26px 1fr 60px 60px 1fr 90px;gap:.6rem;align-items:center;padding:.4rem .9rem;border-bottom:1px solid var(--border);font-size:.82rem">
        ${teamLogo(x.n, 24, '.5rem')}<b style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(x.n)}</b>
        <span style="text-align:right">${x.now} pkt</span><span style="text-align:right;color:var(--muted)">max ${x.max}</span>
        <span style="height:7px;border-radius:4px;background:var(--surface2);overflow:hidden"><span style="display:block;height:100%;width:${x.pct}%;background:${x.clinched ? 'var(--win)' : x.out ? 'var(--loss)' : 'var(--accent)'}"></span></span>
        <b style="text-align:right;color:${x.clinched ? 'var(--win)' : x.out ? 'var(--loss)' : 'var(--text)'}">${x.clinched ? '✅ pewny' : x.out ? '❌ odpadli' : x.pct + '%'}</b>
      </div>`).join('');
  }).join('');
  el.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem">
      <div class="section-title" style="margin-bottom:0;font-size:1.3rem">🔮 Walka o playoff</div>
      <div style="font-size:.72rem;color:var(--muted)">Top ${spots}${groups.length > 1 ? ' z każdej grupy' : ''} awansuje · ${remaining.length} ${_plPL(remaining.length, 'mecz', 'mecze', 'meczów')} do rozegrania
        ${isAdmin ? ` · <select onchange="setPlayoffSpots(+this.value)" style="width:auto;display:inline-block;padding:.1rem .3rem;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:5px;font-size:.72rem">${[1, 2, 3, 4, 5, 6, 8].map(n => `<option ${n === spots ? 'selected' : ''}>${n}</option>`).join('')}</select> miejsc` : ''}</div>
    </div>
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:1.5rem">${rows}
      <div style="padding:.4rem .9rem;font-size:.68rem;color:var(--muted)">Szansa = ${sims} symulacji reszty sezonu z prognozą rankingu siły. ✅/❌ = rozstrzygnięte matematycznie (punkty: wygrana 2, porażka 1, walkower 0).</div>
    </div>`;
}
function setPlayoffSpots(){return __lz(6,'setPlayoffSpots',this,arguments)}

// ═══ 🏆 GALA SEZONU ══════════════════════════════════════════════
function _galaStats(ed) {
  const agg = {};
  _editionMatches(ed).forEach(m => [m.team1, m.team2].forEach(t => (t.players || []).forEach(p => {
    if(!p.name) return;
    const a = agg[p.name] = agg[p.name] || { name: p.name, teams: {}, gp: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 };
    a.gp++; a.teams[t.name] = (a.teams[t.name] || 0) + 1;
    ['pts', 'reb', 'ast', 'stl', 'blk'].forEach(k => a[k] += p[k] || 0); a.to += p.to || p.tov || 0;
  })));
  return Object.values(agg).map(a => ({ ...a, team: Object.entries(a.teams).sort((x, y) => y[1] - x[1])[0]?.[0] || '', eff: (a.pts + a.reb * 1.2 + a.ast * 1.5 + a.stl * 2 + a.blk * 2 - a.to * 1.5) / a.gp }));
}
function _galaCandidates() {
  const ed = _currentEdition();
  const st = _galaStats(ed);
  const maxGp = Math.max(0, ...st.map(x => x.gp));
  const minGp = Math.max(2, Math.round(maxGp * 0.4));
  const pool = st.filter(x => x.gp >= minGp);
  const line = x => `${x.team} · ${(x.pts / x.gp).toFixed(1)} PTS · ${(x.reb / x.gp).toFixed(1)} REB · ${(x.ast / x.gp).toFixed(1)} AST`;
  const cand = (list, sub) => list.slice(0, 4).map(x => ({ id: x.name + '|' + x.team, label: x.name, team: x.team, sub: sub(x) }));
  const cats = [];
  const mvp = [...pool].sort((a, b) => b.eff - a.eff);
  const dpoy = [...pool].sort((a, b) => (b.stl + b.blk) / b.gp - (a.stl + a.blk) / a.gp), dLine = x => `${x.team} · ${(x.stl / x.gp).toFixed(1)} STL · ${(x.blk / x.gp).toFixed(1)} BLK`, DV = _dvCur(); // 🧩 osobno w każdej dywizji
  if(DV) DV.forEach(g => { const M = mvp.filter(x => g.teams.includes(x.team)), Dp = dpoy.filter(x => g.teams.includes(x.team));
    if(M.length >= 2) cats.push({ key: 'mvp_' + g.id, emoji: '👑', title: _g('MVP sezonu · ', 'Season MVP · ') + g.name, candidates: cand(M, line) });
    if(Dp.length >= 2) cats.push({ key: 'dpoy_' + g.id, emoji: '🛡️', title: _g('Obrońca sezonu · ', 'Defender of the season · ') + g.name, candidates: cand(Dp, dLine) }); });
  else { if(mvp.length >= 2) cats.push({ key: 'mvp', emoji: '👑', title: 'MVP sezonu', candidates: cand(mvp, line) });
    if(dpoy.length >= 2) cats.push({ key: 'dpoy', emoji: '🛡️', title: 'Obrońca sezonu', candidates: cand(dpoy, dLine) }); }
  // Odkrycie: pierwszy mecz w lidze w tej edycji
  const firstEd = {};
  _withAllMatches(() => [...matches].sort((a, b) => String(a.date).localeCompare(String(b.date))).forEach(m => [m.team1, m.team2].forEach(t => (t.players || []).forEach(p => { if(p.name && !firstEd[p.name]) firstEd[p.name] = _editionOf(m.seasonId); }))));
  const roy = pool.filter(x => firstEd[x.name] === ed).sort((a, b) => b.eff - a.eff);
  if(roy.length >= 2) cats.push({ key: 'roy', emoji: '🌱', title: 'Odkrycie sezonu', candidates: cand(roy, line) });
  // Największy postęp: PPG względem poprzedniej edycji
  const eds = _editionsList(); const prevEd = eds[eds.indexOf(ed) + 1];
  if(prevEd) {
    const prev = Object.fromEntries(_galaStats(prevEd).filter(x => x.gp >= 2).map(x => [x.name, x.pts / x.gp]));
    const mip = pool.filter(x => prev[x.name] !== undefined).map(x => ({ ...x, d: x.pts / x.gp - prev[x.name] })).filter(x => x.d > 0).sort((a, b) => b.d - a.d);
    if(mip.length >= 2) cats.push({ key: 'mip', emoji: '📈', title: 'Największy postęp', candidates: cand(mip, x => `${x.team} · +${x.d.toFixed(1)} PTS/mecz względem ${prevEd}`) });
  }
  const sClips = clipsList.filter(c => (c.seasonId || null) === (currentSeasonId || null)).sort((a, b) => b.likes - a.likes).slice(0, 4);
  if(sClips.length >= 2) cats.push({ key: 'clip', emoji: '🎬', title: 'Akcja sezonu', candidates: sClips.map(c => ({ id: 'c' + c.id, label: c.title || 'Akcja', sub: `${(c.teams || []).join(' vs ')} · ❤️ ${c.likes}` })) });
  const team5 = mvp.slice(0, 5);
  return { cats, team5, ed };
}
function openGalaCreate(){return __lz(6,'openGalaCreate',this,arguments)}

function runWeekPack(){return __lz(6,'runWeekPack',this,arguments)}


// ═══ 👥 SKŁAD I DOSTĘPNOŚĆ DRUŻYNY (kapitan / admin / gracze drużyny) ═══
let _rosterView = { team: null, week: 'g' };
function linkCaptainNick(){return __lz(6,'linkCaptainNick',this,arguments)}

function openTeamRoster(){return __lz(6,'openTeamRoster',this,arguments)}


// ═══ 👥 ADMIN: UŻYTKOWNICY I SKŁADY ═════════════════════════════
let _uo = { tab: 'teams', q: '', filter: 'all', users: null };
function openUsersOverview(){return __lz(6,'openUsersOverview',this,arguments)}
function _renderUsersOverview(){return __lz(6,'_renderUsersOverview',this,arguments)}


// ═══ 📲 APLIKACJA (PWA): instalacja na telefonie / komputerze ═══
let _installPrompt = null;
const _isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); _installPrompt = e; try { renderQuickLinks(); } catch(x) {} });
window.addEventListener('appinstalled', () => { _installPrompt = null; showToast('📲 Aplikacja zainstalowana!', 'success'); try { renderQuickLinks(); } catch(x) {} });
if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => navigator.serviceWorker.register(location.protocol === 'file:' ? 'sw.js' : '/sw.js').catch(e => console.warn('SW:', e)));
}
function installApp(){return __lz(6,'installApp',this,arguments)}


// ═══ 🎭 ROLE DISCORD (admin) ═════════════════════════════════════
let _rolesOpts = null; function _loadRoleOptions(){return __lz(6,'_loadRoleOptions',this,arguments)}
function rolesPickGuild(){return __lz(6,'rolesPickGuild',this,arguments)}
let discordRoleCfgDraft = null;
function openRolesSettings(){return __lz(6,'openRolesSettings',this,arguments)}
function _rolesForm(){return __lz(6,'_rolesForm',this,arguments)}
function rolesCreate(){return __lz(6,'rolesCreate',this,arguments)}
function testRoles(){return __lz(6,'testRoles',this,arguments)}
function saveRoles(){return __lz(6,'saveRoles',this,arguments)}
function syncRoles(){return __lz(6,'syncRoles',this,arguments)}


function bnGo(){return __lz(6,'bnGo',this,arguments)}
function _bnSync(id) {
  document.querySelectorAll('#bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.v === id || (b.dataset.v === 'more' && !['dashboard', 'schedule', 'mypanel', 'matches'].includes(id))));
}
function openMoreSheet(){return __lz(6,'openMoreSheet',this,arguments)}


// ═══ 🔄 NAZWY DRUŻYN WG SKŁADÓW (Pro-Am „Poland” → drużyna ze strony) ═══
function _normNick(x) { return String(x || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function _lev(a, b) {
  const m = a.length, n = b.length; if(Math.abs(m - n) > 1) return 2;
  const d = Array.from({ length: m + 1 }, (_, i) => [i]);
  for(let j = 1; j <= n; j++) d[0][j] = j;
  for(let i = 1; i <= m; i++) for(let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function _approvedTeamNames() { return teamRegistrations.filter(r => r.status === 'approved').map(r => r.teamName); }
function _rosterIdx() {
  const idx = new Map();
  teamRegistrations.filter(r => r.status === 'approved').forEach(r => (r.players || []).forEach(p => { const k = _normNick(p.gamertag); if(k) idx.set(k, r.teamName); }));
  playersList.filter(p => p.status === 'confirmed' && p.team && p.gamertag).forEach(p => idx.set(_normNick(p.gamertag), p.team));
  return idx;
}
function _rosterHits(players, idx) {
  const counts = {}, who = {};
  (players || []).forEach(pl => {
    const k = _normNick(pl.name || pl.n); if(!k) return;
    let team = idx.get(k);
    if(!team && k.length >= 5) for(const [nick, t] of idx) { if(nick.length >= 5 && _lev(nick, k) <= 1) { team = t; break; } }
    if(team) { counts[team] = (counts[team] || 0) + 1; (who[team] = who[team] || []).push(pl.name || pl.n); }
  });
  return { counts, who };
}
function _guessTeamByRoster(){return __lz(6,'_guessTeamByRoster',this,arguments)}
// Skład ma pierwszeństwo przed nazwą odczytaną ze screena (ta sama logika co w Workerze)
function _fixMatchTeams(m, dryRun) {
  const idx = _rosterIdx();
  const names = _approvedTeamNames();
  const canon = n => names.find(x => x.toLowerCase() === String(n || '').toLowerCase()) || null;
  const plan = {};
  ['team1', 'team2'].forEach(sd => {
    const t = m[sd] || {};
    const { counts } = _rosterHits(t.players, idx);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const best = sorted[0] ? { team: sorted[0][0], hits: sorted[0][1] } : null;
    const second = sorted[1]?.[1] || 0;
    const strong = best && best.hits >= 2 && best.hits >= second * 2;
    const named = canon(t.name) || canon(teamAliasMap[String(t.name || '').toLowerCase()]);
    const namedHits = named ? (counts[named] || 0) : 0;
    let target = named;
    if(!named && strong) target = best.team;
    else if(named && strong && best.team !== named && best.hits >= 3 && namedHits <= 1) target = best.team;
    plan[sd] = { target, counts };
  });
  if(plan.team1.target && plan.team1.target === plan.team2.target) {
    const tgt = plan.team1.target;
    const loser = (plan.team1.counts[tgt] || 0) >= (plan.team2.counts[tgt] || 0) ? 'team2' : 'team1';
    const alt = Object.entries(plan[loser].counts).filter(([t]) => t !== tgt).sort((a, b) => b[1] - a[1])[0];
    plan[loser].target = alt && alt[1] >= 2 ? alt[0] : null;
  }
  const fixes = [];
  ['team1', 'team2'].forEach(sd => {
    const t = m[sd], tg = plan[sd].target;
    if(t && tg && tg !== t.name) { fixes.push({ side: sd, from: t.name, to: tg, hits: plan[sd].counts[tg] || 0 }); if(!dryRun) t.name = tg; }
  });
  return fixes;
}
function openTeamNameFixer(){return __lz(6,'openTeamNameFixer',this,arguments)}
function applySuspiciousFix(){return __lz(6,'applySuspiciousFix',this,arguments)}
function applyTeamNameFix(){return __lz(6,'applyTeamNameFix',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 🏀 FANTASY EKSTRAKLASA (zakładka)
// ═══════════════════════════════════════════════════════════════
let fantasyData = null;   // z Workera: ceny, tygodnie, rankingi
let mySquad = null;       // mój ostatni zapisany skład
let _fx = { tab: 'squad', draft: null, slot: null, q: '', team: '', pos: '', sort: 'price', board: 'season', open: null };
const FX_SLOTS = ['PG', 'SG', 'SF', 'PF', 'C'];
function _fxElig(p, slot) { return !p?.pos?.length || p.pos.includes(slot); }
function _fxPosTxt(){return __lz(6,'_fxPosTxt',this,arguments)}

function _fxP(key) { return fantasyData?.players?.find(p => p.key === key) || null; }
function _fxDraft(){return __lz(6,'_fxDraft',this,arguments)}
function _fxFilled(){return __lz(6,'_fxFilled',this,arguments)}
function fxAutoArrange(){return __lz(6,'fxAutoArrange',this,arguments)}
function _fxCost(){return __lz(6,'_fxCost',this,arguments)}
function _fxTeamCount(){return __lz(6,'_fxTeamCount',this,arguments)}
function _fxNeedsRedo(){return __lz(6,'_fxNeedsRedo',this,arguments)} function _fxDirty(){return __lz(6,'_fxDirty',this,arguments)}
function _fxLockText(){return __lz(6,'_fxLockText',this,arguments)}

function renderFantasy(){return __lz(6,'renderFantasy',this,arguments)}

function _fxCard(){return __lz(6,'_fxCard',this,arguments)}

function _fxTrackerHtml(){return __lz(6,'_fxTrackerHtml',this,arguments)}

function _fxSquadHtml(){return __lz(6,'_fxSquadHtml',this,arguments)}

function _fxMarketHtml(){return __lz(6,'_fxMarketHtml',this,arguments)}

function _fxBoardHtml(){return __lz(6,'_fxBoardHtml',this,arguments)}

function fxAdd(){return __lz(6,'fxAdd',this,arguments)}
function fxRemove(){return __lz(6,'fxRemove',this,arguments)}
function fxCaptain(){return __lz(6,'fxCaptain',this,arguments)}
function fxBenchMove(){return __lz(6,'fxBenchMove',this,arguments)}
function fxNotifyPositions(){return __lz(6,'fxNotifyPositions',this,arguments)}
function fxSave(){return __lz(6,'fxSave',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 💬 REAKCJE I KOMENTARZE
// ═══════════════════════════════════════════════════════════════
let reactionsData = {};
const RX_EMOJI = ['🔥', '😮', '🧱', '👏', '😂'];
let _rxOpen = new Set();
function _reactBar(key) {
  const e = reactionsData[key] || { r: {}, c: [] };
  const me = discordUser?.id;
  const open = _rxOpen.has(key);
  const nC = (e.c || []).length;
  return `<div data-rx="${key}" style="margin-top:.6rem;border-top:1px dashed rgba(127,127,127,.25);padding-top:.5rem" onclick="event.stopPropagation()">
    <div style="display:flex;gap:.3rem;flex-wrap:wrap;align-items:center;justify-content:center">
      ${RX_EMOJI.map(em => { const list = e.r?.[em] || [], on = me && list.includes(me);
        return `<button onclick="rxToggle('${key}','${em}')" style="font-size:.8rem;padding:.12rem .5rem;border-radius:999px;cursor:pointer;font-family:inherit;border:1px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? 'rgba(245,197,24,.15)' : 'transparent'};color:var(--text)">${em}${list.length ? ` <b style="font-size:.72rem">${list.length}</b>` : ''}</button>`; }).join('')}
      <button onclick="rxToggleComments('${key}')" style="font-size:.74rem;padding:.12rem .55rem;border-radius:999px;cursor:pointer;font-family:inherit;border:1px solid ${open ? 'var(--accent)' : 'var(--border)'};background:transparent;color:var(--muted)">💬 ${nC || 'Komentuj'}</button>
    </div>
    ${open ? `<div style="margin-top:.5rem;display:flex;flex-direction:column;gap:.3rem;max-height:260px;overflow-y:auto;text-align:left">
      ${(e.c || []).map(c => `<div style="display:flex;gap:.45rem;align-items:flex-start;background:var(--surface2);border-radius:8px;padding:.35rem .5rem">
        ${_avatarHtml(c.avatar, 20)}
        <div style="flex:1;min-width:0;font-size:.78rem;line-height:1.4"><b>${_h(c.name)}</b> <span style="color:var(--muted);font-size:.66rem">${_ssFmt(String(c.at).slice(0, 10))}</span>
          <div data-notr style="word-break:break-word">${_h(c.text)}</div></div>
        ${(me && c.uid === me) || _isLoggedInSync() ? `<button onclick="rxDelete('${key}','${c.id}')" title="Usuń" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:.75rem">✕</button>` : ''}
      </div>`).join('') || '<div style="font-size:.74rem;color:var(--muted);text-align:center">Brak komentarzy — napisz pierwszy</div>'}
      ${discordUser ? `<div style="display:flex;gap:.3rem;margin-top:.15rem">
          <input id="rx-in-${key}" maxlength="280" placeholder="Napisz komentarz…" onkeydown="if(event.key==='Enter')rxPost('${key}')" style="${_MODAL_INP};font-size:.78rem;padding:.3rem .5rem">
          <button class="btn btn-primary" style="font-size:.72rem;padding:.2rem .6rem" onclick="rxPost('${key}')">Wyślij</button></div>`
        : `<div style="font-size:.72rem;color:var(--muted);text-align:center">Zaloguj się przez Discord, żeby komentować</div>`}
    </div>` : ''}
  </div>`;
}
function _rxRefresh(){return __lz(6,'_rxRefresh',this,arguments)}
function rxToggle(){return __lz(6,'rxToggle',this,arguments)}
function rxToggleComments(){return __lz(6,'rxToggleComments',this,arguments)}
function rxPost(){return __lz(6,'rxPost',this,arguments)}
function rxDelete(){return __lz(6,'rxDelete',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// ⚔️ RYWALIZACJE (historia starć dwóch drużyn)
// ═══════════════════════════════════════════════════════════════
let _h2hMemo = null;
function _h2hGames(a, b) {
  const all = _withAllMatches(() => matches.slice());
  const key = all.length + '|' + (all[0]?.id || '');
  if(!_h2hMemo || _h2hMemo.key !== key) _h2hMemo = { key, map: {} };
  const k = [a, b].map(x => String(x).toLowerCase()).sort().join('|');
  if(_h2hMemo.map[k]) return _h2hMemo.map[k];
  const A = String(a).toLowerCase(), B = String(b).toLowerCase();
  return (_h2hMemo.map[k] = all.filter(m => !m.walkover && [String(m.team1?.name).toLowerCase(), String(m.team2?.name).toLowerCase()].sort().join('|') === k)
    .sort((x, y) => String(y.date).localeCompare(String(x.date))));
}
function _isClassic(a, b) { return _h2hGames(a, b).length >= 6; }
function openRivalry(){return __lz(6,'openRivalry',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 🔮 TYPY PRZEDSEZONOWE
// ═══════════════════════════════════════════════════════════════
let predictionsData = {}, myPredictions = {};
const PRED_DEF = [
  { k: 'champion', icon: '🏆', label: 'Mistrz sezonu', type: 'team', pts: 5 },
  { k: 'mvp', icon: '⭐', label: 'MVP sezonu', type: 'player', pts: 3 },
  { k: 'roy', icon: '🌱', label: 'Debiutant roku', type: 'player', pts: 3 },
  { k: 'scorer', icon: '🎯', label: 'Król strzelców', type: 'player', pts: 2 },
  { k: 'last', icon: '📉', label: 'Ostatnie miejsce', type: 'team', pts: 2 }
];
function _predPoints(pick, results) { return _predDefs().reduce((s, d) => s + (results?.[d.k] && pick?.[d.k] && String(pick[d.k]).toLowerCase() === String(results[d.k]).toLowerCase() ? d.pts : 0), 0); }
function _predCardHtml(ctx) {
  if(ctx.demo || !ctx.seasonId) return '';
  const sid = ctx.seasonId, pd = predictionsData[sid] || { locked: false, counts: {}, total: 0 };
  const lockAt = pd.lockAt ? new Date(pd.lockAt) : null;
  const locked = pd.locked || (lockAt && Date.now() >= +lockAt);
  const isAdmin = _isLoggedInSync();
  const mine = myPredictions[sid] || {};
  const teams = teamRegistrations.filter(r => (r.status === 'approved' || r.payment?.status === 'paid') && (!r.seasonId || r.seasonId === sid)).map(r => r.teamName).sort((x, y) => x.localeCompare(y, 'pl'));
  const players = [...new Set(teamRegistrations.filter(r => (r.status === 'approved' || r.payment?.status === 'paid') && (!r.seasonId || r.seasonId === sid)).flatMap(r => (r.players || []).map(p => p.gamertag)))].sort((x, y) => x.localeCompare(y, 'pl'));
  const share = (k, v) => { const c = pd.counts?.[k] || {}, tot = Object.values(c).reduce((s, x) => s + x, 0); return tot && c[v] ? Math.round(c[v] / tot * 100) : 0; };
  const topOf = k => Object.entries(pd.counts?.[k] || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const res = pd.results;
  const sel = (d, val, opts, dis) => `<select id="pred-${d.k}" ${dis ? 'disabled' : ''} style="${_MODAL_INP};font-size:.8rem;padding:.3rem .45rem"><option value="">— wybierz —</option>${opts.map(o => `<option ${String(o) === String(val || '') ? 'selected' : ''}>${_h(o)}</option>`).join('')}</select>`;
  const head = `<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;padding:.55rem .75rem;border-bottom:1px solid var(--border)">
      <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted)">🔮 TYPY PRZEDSEZONOWE</div>
      <span style="font-size:.7rem;color:${locked ? 'var(--muted)' : 'var(--win)'}">${res ? '✅ rozliczone' : locked ? '🔒 zamknięte' : lockAt ? `⏳ do ${lockAt.toLocaleString('pl-PL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''} · ${pd.total || 0} ${_plPL(pd.total || 0, 'osoba', 'osoby', 'osób')}</span></div>`;
  let body = '';
  if(!locked) {
    body = discordUser ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.5rem;padding:.6rem .75rem">
        ${_predDefs().map(d => `<div><div style="font-size:.7rem;font-weight:700;margin-bottom:.2rem">${d.icon} ${d.label} <span style="color:var(--accent)">+${d.pts}</span></div>${sel(d, mine[d.k], d.type === 'team' ? (d.teams || teams) : players)}
          ${mine[d.k] && share(d.k, mine[d.k]) ? `<div style="font-size:.64rem;color:var(--muted);margin-top:.15rem">${share(d.k, mine[d.k])}% kibiców typuje to samo</div>` : ''}</div>`).join('')}
      </div>
      <div style="padding:0 .75rem .65rem;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap"><button class="btn btn-primary" style="font-size:.74rem" onclick="predSave('${sid}')">💾 Zapisz typy</button>
        <span style="font-size:.7rem;color:var(--muted)">Typy innych zobaczysz po zamknięciu. Rozliczenie na koniec sezonu.</span></div>`
      : `<div style="padding:.8rem;text-align:center;font-size:.8rem;color:var(--muted)">Zaloguj się przez Discord, żeby wytypować mistrza, MVP i resztę.</div>`;
  } else {
    // po zamknięciu: najczęstsze typy + (po rozliczeniu) ranking
    const ranking = res && pd.picks ? pd.picks.map(p => ({ ...p, pts: _predPoints(p, res) })).sort((a, b) => b.pts - a.pts || String(a.name).localeCompare(String(b.name))) : null;
    body = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.5rem;padding:.6rem .75rem">
      ${_predDefs().map(d => `<div style="background:var(--surface2);border-radius:8px;padding:.45rem .55rem">
        <div style="font-size:.7rem;font-weight:700;margin-bottom:.2rem">${d.icon} ${d.label}${res?.[d.k] ? ` → <b style="color:var(--win)">${_h(res[d.k])}</b>` : ''}</div>
        ${topOf(d.k).map(([v, n]) => `<div style="font-size:.72rem;display:flex;justify-content:space-between;gap:.4rem"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${res?.[d.k] === v ? 'color:var(--win);font-weight:800' : ''}">${_h(v)}</span><span style="color:var(--muted)">${share(d.k, v)}%</span></div>`).join('') || '<div style="font-size:.7rem;color:var(--muted)">brak typów</div>'}
        ${mine[d.k] ? `<div style="font-size:.64rem;color:var(--muted);margin-top:.2rem">Twój typ: <b style="color:var(--text)">${_h(mine[d.k])}</b>${res?.[d.k] ? (String(mine[d.k]).toLowerCase() === String(res[d.k]).toLowerCase() ? ' ✅' : ' ❌') : ''}</div>` : ''}
      </div>`).join('')}
    </div>
    ${ranking ? `<div style="padding:0 .75rem .6rem">${ranking.slice(0, 15).map((x, i) => `<div style="display:grid;grid-template-columns:28px 24px 1fr auto;gap:.5rem;align-items:center;padding:.25rem 0;border-bottom:1px solid var(--border);font-size:.8rem;${x.id === discordUser?.id ? 'font-weight:800' : ''}">
        <b style="color:${i < 3 ? 'var(--accent)' : 'var(--muted)'}">${['🥇', '🥈', '🥉'][i] || i + 1}</b>${_avatarHtml(x.avatar, 22)}<span>${_h(x.name)}</span><b style="color:var(--accent)">${x.pts}</b></div>`).join('')}</div>` : ''}`;
  }
  const admin = isAdmin ? `<details style="padding:.4rem .75rem .6rem;font-size:.74rem"><summary style="cursor:pointer;color:var(--accent)">⚙ Admin: termin i rozliczenie</summary>
      <div style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;margin:.45rem 0">Zamknięcie typów: <input type="datetime-local" id="pred-lock" value="${lockAt ? new Date(+lockAt - lockAt.getTimezoneOffset() * 6e4).toISOString().slice(0, 16) : ''}" style="${_MODAL_INP};width:auto;font-size:.76rem;padding:.25rem .4rem">
        <button class="btn btn-ghost" style="font-size:.7rem" onclick="predAdmin('${sid}','lock')">Zapisz termin</button><span style="color:var(--muted)">(domyślnie start Week 1 — dla trwającego sezonu ustaw późniejszy)</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.4rem">${_predDefs().map(d => `<div><div style="font-size:.66rem">${d.icon} ${d.label}</div><select id="pres-${d.k}" style="${_MODAL_INP};font-size:.74rem;padding:.25rem .4rem"><option value="">—</option>${(d.type === 'team' ? teams : players).map(o => `<option ${res?.[d.k] === o ? 'selected' : ''}>${_h(o)}</option>`).join('')}</select></div>`).join('')}</div>
      <div style="margin-top:.45rem;display:flex;gap:.4rem"><button class="btn btn-primary" style="font-size:.7rem" onclick="predAdmin('${sid}','results')">🏁 Rozlicz typy</button>${res ? `<button class="btn btn-ghost" style="font-size:.7rem" onclick="predAdmin('${sid}','clear')">Cofnij rozliczenie</button>` : ''}</div>
    </details>` : '';
  if(!discordUser && locked && !res && !pd.total) return '';
  return `<div class="card" style="padding:0;margin:0 0 1rem;overflow:hidden">${head}${body}${admin}</div>`;
}
function predSave(){return __lz(6,'predSave',this,arguments)}
function predAdmin(){return __lz(6,'predAdmin',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 🎁 WRAPPED SEZONU
// ═══════════════════════════════════════════════════════════════
let _wr = { tab: null, scope: 'season' };
function _wrPlayer(){return __lz(7,'_wrPlayer',this,arguments)}
function _wrFan(){return __lz(7,'_wrFan',this,arguments)}
function _wrLoadExtra(){return __lz(7,'_wrLoadExtra',this,arguments)}
function _wrExtraBody(){return __lz(7,'_wrExtraBody',this,arguments)}
function wrappedShare(){return __lz(7,'wrappedShare',this,arguments)}
function announceWrapped(){return __lz(7,'announceWrapped',this,arguments)}

function openWrapped(){return __lz(7,'openWrapped',this,arguments)}
function wrappedCard(){return __lz(7,'wrappedCard',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 📺 MULTISTREAM — kilka transmisji obok siebie
// ═══════════════════════════════════════════════════════════════
let _ms = { sel: null, audio: null, cols: 2 };
function _msEmbed(){return __lz(7,'_msEmbed',this,arguments)}
function _msPlatform(){return __lz(7,'_msPlatform',this,arguments)}
function _msSources(){return __lz(7,'_msSources',this,arguments)}
function openMultistream(){return __lz(7,'openMultistream',this,arguments)}
function renderMultistream(){return __lz(7,'renderMultistream',this,arguments)}
function msToggle(){return __lz(7,'msToggle',this,arguments)}

// ═══ 📊 ZAAWANSOWANE STATYSTYKI (gracz i drużyna) ═══
let _advScope = 'season';
function _advGames(name, scope) {
  const out = [];
  _mpMatches(scope).forEach(m => [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, o]) => {
    const p = (t.players || []).find(x => _mpSame(x.name, name)); if(!p) return;
    const teamFga = (t.players || []).reduce((s, x) => s + (x.fga || 0), 0);
    out.push({ ...p, team: t.name, ts: +t.score || 0, os: +o.score || 0, won: (+t.score || 0) > (+o.score || 0), teamFga, date: m.date });
  }));
  return out;
}
function _advCalc(g) {
  const n = g.length; if(!n) return null;
  const S = k => g.reduce((s, x) => s + (+x[k] || 0), 0);
  const pts = S('pts'), fga = S('fga'), fgm = S('fgm'), fta = S('fta'), tpm = S('tpm'), tpa = S('tpa'), ast = S('ast'), to = S('to');
  const close = g.filter(x => Math.abs(x.ts - x.os) <= 5), wins = g.filter(x => x.won), losses = g.filter(x => !x.won);
  const avg = arr => arr.length ? arr.reduce((s, x) => s + (x.pts || 0), 0) / arr.length : null;
  const mean = pts / n, sd = Math.sqrt(g.reduce((s, x) => s + ((x.pts || 0) - mean) ** 2, 0) / n);
  return { n, ppg: mean,
    ts: fga + fta ? pts / (2 * (fga + 0.44 * fta)) * 100 : null,
    efg: fga ? (fgm + 0.5 * tpm) / fga * 100 : null,
    astTo: to ? ast / to : (ast ? ast : null),
    stocks: (S('stl') + S('blk')) / n,
    usage: S('teamFga') ? fga / S('teamFga') * 100 : null,
    ptsShare: S('ts') ? pts / S('ts') * 100 : null,
    tpRate: fga ? tpa / fga * 100 : null,
    ftRate: fga ? fta / fga * 100 : null,
    winPpg: avg(wins), lossPpg: avg(losses),
    close: { n: close.length, w: close.filter(x => x.won).length, ppg: avg(close) },
    cv: mean ? sd / mean : null };
}
function _advPlayerHtml(name) {
  const g = _advGames(name, _advScope), a = _advCalc(g);
  const f1 = v => v == null ? '—' : (Math.round(v * 10) / 10).toFixed(1);
  // porównanie z ligą: TS% na tle graczy z min. 40% meczów lidera
  let tsPct = null;
  try {
    const pool = _mpAgg(() => true, _advScope).filter(r => r.gp), maxGp = Math.max(...pool.map(r => r.gp));
    const vals = pool.filter(r => r.gp >= maxGp * 0.4 && !_mpSame(r.name, name)).map(r => _advCalc(_advGames(r.name, _advScope))?.ts).filter(v => v != null);
    if(a?.ts != null && vals.length >= 5) tsPct = Math.round(vals.filter(v => v < a.ts).length / vals.length * 100);
  } catch(e) {}
  const chip = (v, l) => `<button onclick="_advScope='${v}';this.closest('[data-adv]').outerHTML=_advPlayerHtml(this.closest('[data-adv]').dataset.adv)" style="font-size:.66rem;padding:.1rem .5rem;border-radius:999px;cursor:pointer;font-family:inherit;border:1px solid ${_advScope === v ? 'var(--accent)' : 'var(--border)'};background:transparent;color:${_advScope === v ? 'var(--accent)' : 'var(--muted)'}">${l}</button>`;
  const tile = (v, l, hint) => `<div title="${_h(hint)}" style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.45rem .4rem;text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.2rem">${v}</div><div style="font-size:.58rem;font-weight:800;letter-spacing:1px;color:var(--muted)">${l}</div></div>`;
  const reg = a?.cv == null ? '—' : a.cv < 0.25 ? '🧱 bardzo regularny' : a.cv < 0.45 ? '📏 regularny' : '🎢 zmienny';
  return `<div data-adv="${_h(name)}" style="margin-top:1rem;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:.75rem .85rem">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.55rem">
      <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted)">📊 ZAAWANSOWANE STATYSTYKI</div>
      <div style="display:flex;gap:.25rem">${chip('season', 'Sezon')}${chip('edition', _editionOf(currentSeasonId) || 'Edycja')}${chip('career', 'Kariera')}</div>
    </div>
    ${a ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(78px,1fr));gap:.35rem;margin-bottom:.55rem">
      ${tile(a.ts != null ? f1(a.ts) + '%' : '—', 'TS%', 'True Shooting — skuteczność z uwzględnieniem trójek i rzutów wolnych')}
      ${tile(a.efg != null ? f1(a.efg) + '%' : '—', 'eFG%', 'Effective FG — trójka liczy się jak 1,5 rzutu')}
      ${tile(a.astTo != null ? f1(a.astTo) : '—', 'AST/TO', 'Asysty na jedną stratę')}
      ${tile(f1(a.stocks), 'STL+BLK', 'Przechwyty + bloki na mecz')}
      ${tile(a.usage != null ? f1(a.usage) + '%' : '—', 'UDZIAŁ RZUTÓW', 'Jaką część rzutów drużyny oddaje zawodnik')}
      ${tile(a.ptsShare != null ? f1(a.ptsShare) + '%' : '—', 'UDZIAŁ PKT', 'Jaką część punktów drużyny zdobywa zawodnik')}
      ${tile(a.tpRate != null ? f1(a.tpRate) + '%' : '—', 'RZUTY ZA 3', 'Odsetek rzutów oddawanych zza łuku')}
      ${tile(a.ftRate != null ? f1(a.ftRate) + '%' : '—', 'FT RATE', 'Rzuty wolne na 100 rzutów z gry — jak często wymusza faule')}
    </div>
    <div style="display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;line-height:1.45">
      ${tsPct != null ? `<div>🎯 Skuteczność (TS%) lepsza niż <b style="color:var(--accent)">${tsPct}%</b> graczy ligi</div>` : ''}
      <div>⚖️ <b>W wyrównanych meczach</b> (różnica ≤ 5 pkt): ${a.close.n ? `${a.close.w}-${a.close.n - a.close.w} · <b>${f1(a.close.ppg)}</b> PTS/mecz` : 'jeszcze nie grał'}</div>
      <div>🏆 W wygranych: <b>${f1(a.winPpg)}</b> PTS · 💔 w przegranych: <b>${f1(a.lossPpg)}</b> PTS</div>
      <div>📈 Regularność: ${reg} <span style="color:var(--muted)">(${a.n} ${_plPL(a.n, 'mecz', 'mecze', 'meczów')})</span></div>
    </div>` : '<div style="font-size:.78rem;color:var(--muted)">Brak meczów w tym zakresie.</div>'}
  </div>`;
}
function _advTeamHtml(team) {
  const low = String(team).toLowerCase(), q = [[0, 0], [0, 0], [0, 0], [0, 0]];
  let nq = 0, close = 0, closeW = 0, comeback = 0, blown = 0, n = 0, w = 0, ot = 0;
  _mpMatches('season').forEach(m => [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, o]) => {
    if(String(t?.name).toLowerCase() !== low) return;
    n++; const won = (+t.score || 0) > (+o.score || 0); if(won) w++;
    if(Math.abs((+t.score || 0) - (+o.score || 0)) <= 5) { close++; if(won) closeW++; }
    const tq = (t.quarters || []).map(Number), oq = (o.quarters || []).map(Number);
    if(tq.length >= 4 && oq.length >= 4) {
      nq++; for(let i = 0; i < 4; i++) { q[i][0] += tq[i] || 0; q[i][1] += oq[i] || 0; }
      const after3 = tq.slice(0, 3).reduce((s, x) => s + x, 0) - oq.slice(0, 3).reduce((s, x) => s + x, 0);
      if(after3 < 0 && won) comeback++;
      if(after3 > 0 && !won) blown++;
      if(tq.length > 4) ot++;
    }
  }));
  if(!n) return '';
  const f1 = v => (Math.round(v * 10) / 10).toFixed(1);
  const qRow = nq ? q.map(([a, b], i) => { const d = (a - b) / nq;
    return `<div style="background:var(--surface2);border-radius:8px;padding:.4rem;text-align:center"><div style="font-size:.6rem;font-weight:800;color:var(--muted)">Q${i + 1}</div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.05rem">${f1(a / nq)}:${f1(b / nq)}</div>
      <div style="font-size:.68rem;font-weight:800;color:${d >= 0 ? 'var(--win)' : 'var(--loss)'}">${d >= 0 ? '+' : ''}${f1(d)}</div></div>`; }).join('') : '';
  const best = nq ? q.map(([a, b], i) => [i, (a - b) / nq]).sort((x, y) => y[1] - x[1]) : [];
  return `<div style="margin-top:1.2rem;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:.75rem .85rem">
    <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.55rem">📊 KWARTY I KOŃCÓWKI — TEN SEZON</div>
    ${nq ? `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.35rem;margin-bottom:.55rem">${qRow}</div>` : ''}
    <div style="display:flex;flex-direction:column;gap:.25rem;font-size:.8rem;line-height:1.45">
      ${nq ? `<div>💪 Najmocniejsza kwarta: <b>Q${best[0][0] + 1}</b> · najsłabsza: <b>Q${best[3][0] + 1}</b></div>` : ''}
      <div>⚖️ Wyrównane mecze (≤ 5 pkt): <b>${closeW}-${close - closeW}</b></div>
      ${nq ? `<div>🔄 Odrobione straty po 3. kwarcie: <b>${comeback}</b> · 😬 roztrwonione prowadzenie: <b>${blown}</b>${ot ? ` · ⏱ dogrywki: <b>${ot}</b>` : ''}</div>` : ''}
      ${nq < n ? `<div style="font-size:.68rem;color:var(--muted)">Kwarty z ${nq} z ${n} meczów (reszta bez odczytanych kwart).</div>` : ''}
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// 🔔 POWIADOMIENIA PUSH — włączanie w Moim panelu
// ═══════════════════════════════════════════════════════════════
let _pushState = { supported: 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window, sub: null, prefs: null, checked: false };
function _b64uToBytes(){return __lz(7,'_b64uToBytes',this,arguments)}
function _pushCheck(){return __lz(7,'_pushCheck',this,arguments)}
function _pushCardHtml() {
  const st = _pushState;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent), standalone = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone;
  const box = inner => `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem .85rem;margin-top:.8rem">
    <div style="font-size:.68rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.45rem">🔔 POWIADOMIENIA</div>${inner}</div>`;
  if(!st.supported) return box(`<div style="font-size:.8rem;color:var(--muted)">${isIOS && !standalone ? 'Na iPhonie powiadomienia działają w zainstalowanej aplikacji: Udostępnij → „Do ekranu początkowego”, potem otwórz ligę z ikony i wróć tutaj.' : 'Ta przeglądarka nie obsługuje powiadomień.'}</div>`);
  if(!st.checked) { _pushCheck().then(() => { if(document.getElementById('view-mypanel')?.classList.contains('active')) renderMyPanelView(); }); return box('<div style="font-size:.8rem;color:var(--muted)">⏳ Sprawdzam…</div>'); }
  const p = st.prefs;
  const tog = (k, l) => `<label style="display:flex;align-items:center;justify-content:flex-start;gap:.45rem;font-size:.8rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);cursor:pointer;margin:.15rem 0">
    <input type="checkbox" ${p[k] ? 'checked' : ''} onchange="pushPref('${k}', this.checked)" style="width:auto;margin:0;accent-color:var(--accent)"> ${l}</label>`;
  return box(st.sub ? `
    <div style="font-size:.8rem;margin-bottom:.4rem">✅ Powiadomienia są <b>włączone</b> na tym urządzeniu.</div>
    ${tog('myMatch', '⏰ Mecz mojej drużyny za godzinę')}${tog('fantasy', '🏀 Skład fantasy zamyka się za 3 h')}${tog('typer', '🎯 Wynik mojego typu (trafiony / nie)')}${tog('live', '🔴 Każdy mecz ligi na żywo')}
    <div style="display:flex;gap:.4rem;margin-top:.5rem;flex-wrap:wrap"><button class="btn btn-ghost" style="font-size:.72rem" onclick="pushTest()">🧪 Wyślij test</button><button class="btn btn-ghost" style="font-size:.72rem;color:var(--loss)" onclick="pushDisable()">Wyłącz</button></div>
    <div id="push-diag" style="font-size:.74rem;line-height:1.55;margin-top:.45rem"></div>`
    : `<div style="font-size:.8rem;color:var(--muted);margin-bottom:.5rem">Dostawaj powiadomienia na telefon: mecz Twojej drużyny za godzinę, zamknięcie składu fantasy, wynik Twojego typu.${Notification.permission === 'denied' ? '<br><b style="color:var(--loss)">Powiadomienia są zablokowane w ustawieniach przeglądarki dla tej strony.</b>' : ''}</div>
    <button class="btn btn-primary" style="font-size:.76rem" onclick="pushEnable()" ${Notification.permission === 'denied' ? 'disabled' : ''}>🔔 Włącz powiadomienia</button>`);
}
function pushEnable(){return __lz(7,'pushEnable',this,arguments)}
function pushPref(){return __lz(7,'pushPref',this,arguments)}
function _swVersion(){return __lz(7,'_swVersion',this,arguments)}
function pushTest(){return __lz(7,'pushTest',this,arguments)}
function pushDisable(){return __lz(7,'pushDisable',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 🟣 STATUS „NADAJE TERAZ” (Twitch / Kick przez Workera)
// ═══════════════════════════════════════════════════════════════
let liveStatus = { twitch: {}, kick: {} };
function _chanLive(url) {
  const u = String(url || '');
  let m = u.match(/twitch\.tv\/(?!videos|clip)(\w+)/i); if(m) { const x = liveStatus.twitch?.[m[1].toLowerCase()]; return x ? { ...x, platform: 'Twitch' } : null; }
  m = u.match(/kick\.com\/([\w-]+)/i); if(m) { const x = liveStatus.kick?.[m[1].toLowerCase()]; return x ? { ...x, platform: 'Kick' } : null; }
  return null;
}
async function refreshLiveStatus() {
  try {
    const r = await _api('/live-status', 'GET', null, {});
    if(r.ok) { const before = JSON.stringify(liveStatus); liveStatus = { twitch: r.twitch || {}, kick: r.kick || {}, enabled: r.enabled };
      if(before !== JSON.stringify(liveStatus)) { renderLiveBanner(); renderScheduleDashboard(); if(document.getElementById('view-multistream')?.classList.contains('active')) renderMultistream(); } }
  } catch(e) {}
}
setInterval(() => { if(document.visibilityState === 'visible') refreshLiveStatus(); }, 60000);
setTimeout(refreshLiveStatus, 2500);

// ═══════════════════════════════════════════════════════════════
// 🤖 ZESTAWIENIE DLA KOMEND BOTA (liczone w przeglądarce admina)
// ═══════════════════════════════════════════════════════════════
function _botSnap() {
  const sid = currentSeasonId || null;
  const f1 = v => (Math.round(v * 10) / 10).toFixed(1);
  const standings = (_seasonTable(sid) || []).map(x => ({ team: x.team, w: x.w, l: x.l, pf: x.pf, pa: x.pa, diff: x.diff, form: x.form5 || '' }));
  const players = _mpAgg(() => true, 'season').filter(r => r.gp).map(r => ({ k: _normNick(r.name), name: r.name, team: r.team, gp: r.gp, w: r.w, ppg: f1(r.ppg), rpg: f1(r.rpg), apg: f1(r.apg), fg: r.fg, tp: r.tp, grade: r.grade, best: r.best?.pts || 0 }));
  const eds = new Set(_editionsList().slice(0, 2));
  const games = _withAllMatches(() => matches.slice()).filter(m => !m.walkover && eds.has(_editionOf(m.seasonId))).sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map(m => [m.date || '', m.team1?.name, +m.team1?.score || 0, m.team2?.name, +m.team2?.score || 0]);
  const results = {}, ctx = { demo: false };
  schedule.filter(s => s.generated && (s.seasonId || null) === sid).forEach(s => { const r = _ssResult(ctx, s); if(r?.done) results[String(s.id)] = `${r.w1}:${r.w2}`; });
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' });
  const weeks = [...new Set(schedule.filter(s => s.generated && (s.seasonId || null) === sid && s.weekStart).map(s => s.week + '|' + s.weekStart))].map(x => x.split('|')).sort((a, b) => a[1].localeCompare(b[1]));
  const cur = weeks.filter(w => w[1] <= today).pop();
  const teams = teamRegistrations.filter(r => r.status === 'approved' && (!r.seasonId || r.seasonId === sid)).map(r => r.teamName);
  return { seasonId: sid, season: _seasonName(sid), standings, players, games: games.slice(-400), results, currentWeek: cur ? +cur[0] : null, teams, at: new Date().toISOString() };
}
function openBotCommands(){return __lz(7,'openBotCommands',this,arguments)}
function registerBotCommands(){return __lz(7,'registerBotCommands',this,arguments)}

// ═══ 🔤 DOPASOWANIE NICKÓW DO SKŁADÓW (ta sama logika co w Workerze) ═══
function _ocrNorm(s) { return String(s || '').toLowerCase().replace(/[|!1l]/g, 'i').replace(/0/g, 'o').replace(/5/g, 's').replace(/[^a-z0-9]/g, ''); }
function _levFull(a, b) {
  const m = a.length, n = b.length; if(!m) return n; if(!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for(let i = 1; i <= m; i++) { const cur = [i]; for(let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
function _nameCands(team) {
  const low = String(team || '').toLowerCase(), out = new Map();
  const add = (n, w) => { const k = _ocrNorm(n); if(!k) return; const c = out.get(k); if(!c || w > c.weight) out.set(k, { name: n, weight: w }); };
  teamRegistrations.filter(r => r.status === 'approved' && String(r.teamName).toLowerCase() === low).forEach(r => (r.players || []).forEach(p => add(p.gamertag, 1)));
  playersList.filter(p => p.status === 'confirmed' && p.gamertag && String(p.team).toLowerCase() === low).forEach(p => add(p.gamertag, 1));
  const cnt = {};
  _withAllMatches(() => matches.slice(-300)).forEach(m => [m.team1, m.team2].forEach(t => { if(String(t?.name).toLowerCase() !== low) return; (t.players || []).forEach(p => { if(p.name) cnt[p.name] = (cnt[p.name] || 0) + 1; }); }));
  Object.entries(cnt).forEach(([n, c]) => add(n, 2 + c));
  const list = [...out.entries()].map(([k, v]) => ({ k, ...v })), hist = list.filter(x => x.weight > 1);
  list.filter(x => x.weight === 1).forEach(x => { const h = hist.find(y => _levFull(y.k, x.k) <= 1); if(h) x.name = h.name; });
  return list;
}
function _fixPlayerNames(m) {
  const fixes = [];
  ['team1', 'team2'].forEach(sd => {
    const t = m[sd]; if(!t?.players?.length) return;
    const cands = _nameCands(t.name), used = new Set();
    const order = t.players.map(p => ({ p, k: _ocrNorm(p.name) })).sort((a, b) => (cands.some(c => c.k === b.k) ? 1 : 0) - (cands.some(c => c.k === a.k) ? 1 : 0));
    order.forEach(({ p, k }) => {
      if(!p.name) return;
      const al = aliases?.[p.name];
      if(al && al !== p.name) { fixes.push({ from: p.name, to: al }); p.name = al; return; }
      const exact = cands.find(c => c.k === k && !used.has(c.k));
      if(exact) { if(exact.name !== p.name) fixes.push({ from: p.name, to: exact.name }); p.name = exact.name; cands.filter(c => c.name === exact.name).forEach(c => used.add(c.k)); return; }
      if(k.length < 4) return;
      const sc = cands.filter(c => !used.has(c.k) && c.k.length >= 4).map(c => ({ c, d: _levFull(c.k, k) })).sort((a, b) => a.d - b.d || b.c.weight - a.c.weight);
      const best = sc[0], second = sc[1], limit = Math.max(1, Math.floor(Math.max(k.length, best?.c.k.length || 0) / 5));
      if(best && best.d <= limit && (!second || second.d > best.d || second.c.name === best.c.name)) { fixes.push({ from: p.name, to: best.c.name }); p.name = best.c.name; cands.filter(c => c.name === best.c.name).forEach(c => used.add(c.k)); }
    });
  });
  return fixes;
}

function openRemindersStatus(){return __lz(7,'openRemindersStatus',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 🗓 ASYSTENT TERMINÓW — najlepsze okna wg dostępności obu drużyn
// ═══════════════════════════════════════════════════════════════
const _DOW_PL = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
function _ssFindSlots(s) {
  if(!s.weekStart) return [];
  const A = _teamPlayers(s.team1, s.seasonId), B = _teamPlayers(s.team2, s.seasonId);
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' });
  const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  const toMin = t => { const [h, m] = String(t || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
  const free = (p, dow, f, t) => { if(!_availOn(p, s.week, dow)) return false; const h = p.hours?.[dow]; if(!h) return true; return toMin(h[0]) <= f && toMin(h[1] === '00:00' ? '24:00' : h[1]) >= t; };
  const out = [];
  for(let dow = 0; dow < 7; dow++) {
    const date = _ssAddDays(s.weekStart, dow);
    if(date < today) continue;
    let best = null;
    for(let f = 17 * 60; f <= 22 * 60; f += 30) {
      const t = f + 120, a = A.filter(p => free(p, dow, f, t)).length, b = B.filter(p => free(p, dow, f, t)).length;
      const score = Math.min(a, b) * 100 + (a + b) - Math.abs(f - 20 * 60) / 60; // więcej graczy, preferowane okolice 20:00
      if(!best || score > best.score) best = { dow, date, from: hm(f), to: hm(t), a, b, score };
    }
    if(best && (best.a || best.b)) out.push(best);
  }
  return out.sort((x, y) => y.score - x.score).slice(0, 3);
}
function _ssSlotsHtml(k, s, canPropose) {
  const slots = _ssFindSlots(s);
  const nA = _teamPlayers(s.team1, s.seasonId).length, nB = _teamPlayers(s.team2, s.seasonId).length;
  if(!nA || !nB) return `<div style="font-size:.68rem;color:var(--muted);margin:.3rem 0">🧠 Asystent terminów zadziała, gdy gracze obu drużyn ustawią dostępność w Moim panelu.</div>`;
  if(!slots.length) return `<div style="font-size:.68rem;color:var(--muted);margin:.3rem 0">🧠 Brak wspólnych dni w dostępności graczy w tym tygodniu.</div>`;
  const ok = x => x.a >= 5 && x.b >= 5;
  return `<div style="background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.4);border-radius:8px;padding:.4rem .55rem;margin:.35rem 0 .45rem">
    <div style="font-size:.64rem;font-weight:800;letter-spacing:.5px;color:#a78bfa;margin-bottom:.25rem">🧠 NAJLEPSZE TERMINY WG DOSTĘPNOŚCI</div>
    ${slots.map((x, i) => `<div style="display:flex;justify-content:space-between;gap:.4rem;font-size:.72rem;padding:.1rem 0">
      <span><b>${_DOW_PL[x.dow]} ${x.date.slice(8, 10)}.${x.date.slice(5, 7)}</b> · ${x.from}–${x.to}</span>
      <span style="color:${ok(x) ? 'var(--win)' : 'var(--muted)'}">👥 ${x.a} + ${x.b}${ok(x) ? ' ✓' : ''}</span></div>`).join('')}
    ${canPropose ? `<button class="btn btn-primary" style="width:100%;font-size:.68rem;padding:.2rem .3rem;margin-top:.3rem" onclick="ssProposeSlots('${k}')">✨ Zaproponuj ${slots.length > 1 ? '2 najlepsze' : 'ten termin'}</button>` : ''}
    <div style="font-size:.6rem;color:var(--muted);margin-top:.2rem">Liczba graczy obu drużyn dostępnych w tym oknie (wg Moich paneli).</div>
  </div>`;
}
function ssProposeSlots(){return __lz(7,'ssProposeSlots',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 🛡 KONTROLA JAKOŚCI WYNIKÓW (flagi z Workera + mecze dodane na stronie)
// ═══════════════════════════════════════════════════════════════
function _qualityCheck(m) {
  const f = [];
  [['team1', m.team1], ['team2', m.team2]].forEach(([, t]) => {
    if(!t) return;
    const ps = t.players || [];
    if(ps.length) { const sum = ps.reduce((s, p) => s + (+p.pts || 0), 0); if(sum !== (+t.score || 0)) f.push(`${t.name}: suma punktów graczy ${sum} ≠ wynik ${t.score}`); }
    if((t.quarters || []).length >= 4) { const q = t.quarters.reduce((s, x) => s + (+x || 0), 0); if(q !== (+t.score || 0)) f.push(`${t.name}: suma kwart ${q} ≠ wynik ${t.score}`); }
    if(ps.length && ps.length < 3) f.push(`${t.name}: tylko ${ps.length} ${_plPL(ps.length, 'gracz', 'graczy', 'graczy')} w statystykach`);
  });
  const n1 = new Set((m.team1?.players || []).map(p => _normNick(p.name)));
  (m.team2?.players || []).forEach(p => { if(n1.has(_normNick(p.name))) f.push(`${p.name} jest w obu drużynach`); });
  if(m.team1?.name && m.team1.name === m.team2?.name) f.push('Obie drużyny mają tę samą nazwę');
  return f;
}
function _qualityList() {
  return _withAllMatches(() => matches.slice()).filter(m => !m.qualityOk && !m.walkover)
    .map(m => ({ m, flags: [...new Set([...(m.qualityFlags || []), ..._qualityCheck(m)])] })).filter(x => x.flags.length)
    .sort((a, b) => String(b.m.date).localeCompare(String(a.m.date)));
}
function openQualityReview(){return __lz(7,'openQualityReview',this,arguments)}
function qualityOk(){return __lz(7,'qualityOk',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 📋 PIERWSZE KROKI (gracz / kapitan) — w Moim panelu
// ═══════════════════════════════════════════════════════════════
function _firstStepsHtml() {
  if(!discordUser || localStorage.getItem('nba2k_steps_hidden') === '1') return '';
  const team = _myTeamName(), sid = currentSeasonId || null;
  const capReg = teamRegistrations.find(r => r.status === 'approved' && r.captain?.id === discordUser.id && (!sid || !r.seasonId || r.seasonId === sid));
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone;
  const steps = [
    { done: !!team, t: '🔗 Połącz konto z drużyną', go: "document.getElementById('me-profile-box')?.scrollIntoView({behavior:'smooth'})" },
    { done: !!myProfile?.gamertag || !!capReg, t: '🎮 Wybierz swój nick ze składu', go: "document.getElementById('me-profile-box')?.scrollIntoView({behavior:'smooth'})" },
    { done: !!(myProfile?.days || []).some(Boolean), t: '📅 Ustaw, w które dni możesz grać', go: "document.getElementById('me-profile-box')?.scrollIntoView({behavior:'smooth'})" },
    { done: !!_pushState.sub, t: '🔔 Włącz powiadomienia', go: "document.getElementById('push-diag')?.scrollIntoView({behavior:'smooth'})||window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'})", skip: !_pushState.supported },
    { done: !!standalone, t: '📲 Zainstaluj aplikację na telefonie', go: 'installApp()' },
    { done: Object.keys(myVotes || {}).length > 0, t: '🎯 Wytypuj pierwszy mecz w typerze', go: "showView('schedule')" },
    { done: !!mySquad, t: '🏀 Zbuduj skład w Fantasy', go: "showView('fantasy')" }
  ].filter(x => !x.skip);
  if(capReg) steps.push(
    { done: !!capReg.logo, t: '🧢 Dodaj logo drużyny', go: `changeTeamLogo('${capReg.id}')` },
    { done: !!capReg.streamUrl, t: '🧢 Ustaw kanał transmisji drużyny', go: `openTeamStreamModal('${capReg.id}')` },
    { done: !!capReg.xHandle, t: '🧢 Podaj profil X (Twitter) drużyny', go: `openTeamXModal('${capReg.id}')` },
    { done: _teamPlayers(capReg.teamName, sid).length >= 3, t: '🧢 Zaproś graczy do połączenia kont (min. 3)', go: `openTeamRoster('${String(capReg.teamName).replace(/'/g, "\\'")}','g')` }
  );
  const done = steps.filter(x => x.done).length;
  if(done === steps.length) return '';
  const pct = Math.round(done / steps.length * 100);
  return `<div style="background:var(--surface2);border:1px solid var(--accent);border-radius:10px;padding:.65rem .85rem;margin-bottom:.8rem">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">
      <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--accent)">📋 PIERWSZE KROKI · ${done}/${steps.length}</div>
      <button onclick="localStorage.setItem('nba2k_steps_hidden','1');renderMyPanelView()" title="Ukryj" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:.8rem">✕</button>
    </div>
    <div style="height:5px;border-radius:3px;background:var(--surface);overflow:hidden;margin:.4rem 0 .5rem"><div style="height:100%;width:${pct}%;background:var(--accent)"></div></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.25rem .8rem">
      ${steps.map(x => `<div ${x.done ? '' : `onclick="${x.go}"`} style="font-size:.78rem;padding:.15rem 0;${x.done ? 'color:var(--muted);text-decoration:line-through' : 'cursor:pointer'}">${x.done ? '✅' : '⬜'} ${x.t}</div>`).join('')}
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// 🎙 PODCAST LIGI — scenariusz z danych + nagranie naturalnymi głosami (Gemini TTS)
// ═══════════════════════════════════════════════════════════════
const POD_VOICES = [['Puck', 'Puck — energiczny (M)'], ['Fenrir', 'Fenrir — emocjonalny (M)'], ['Charon', 'Charon — spokojny narrator (M)'], ['Orus', 'Orus — zdecydowany (M)'],
  ['Kore', 'Kore — pewna siebie (K)'], ['Zephyr', 'Zephyr — jasna, pogodna (K)'], ['Aoede', 'Aoede — swobodna (K)'], ['Leda', 'Leda — młodzieżowa (K)']];
const POD_SAMPLE = `Kuba: Cześć, tu Kuba — i zaczynamy Ekstraklasa Weekly, czyli wszystko, co ważne z ostatniego tygodnia ligi 2K Pro-Am.
Ola: A ja jestem Ola. Kuba, powiem ci jedno: ten tydzień był pełen niespodzianek. Zaczynamy od hitu?
Kuba: Jasne. Polish Boars kontra Polish Aliens, klasyk tej ligi, i znowu było nerwowo. Boarsi wygrali pierwszy mecz, ale w drugim Aliens odpowiedzieli i skończyło się remisem jeden do jednego.
Ola: I tu ukłon dla kibiców, bo ponad połowa typowała właśnie remis. Nowa opcja w typerze od razu zrobiła robotę!
Kuba: Bohater tygodnia? Dla mnie Stachu. Dziewiętnaście punktów, dwanaście zbiórek i osiem na dziewięć z gry. To nie był mecz, to był pokaz.
Ola: Zgoda, ale muszę dorzucić qLechu — ponad dwadzieścia punktów na mecz i najlepszy strzelec Boarsów. Na fantasy kosztuje już piętnaście milionów i chyba nikt nie żałuje.
Kuba: W przyszłym tygodniu czeka nas starcie Illegal Esports z Polish Boars. Ola, typuj.
Ola: Stawiam na Boarsów, dwa do zera. A ty?
Kuba: Idę pod prąd — Illegal Esports. Sprawdzimy za tydzień, kto miał rację.
Ola: To wszystko na dziś. Wyniki, statystyki i transmisje znajdziecie na chemikleagues kropka com.
Kuba: Do usłyszenia za tydzień — i powodzenia w meczach!`;
let _pod = { script: null, n1: 'Kuba', n2: 'Ola', v1: 'Puck', v2: 'Kore', wav: null, mp3: null, url: null };
function openPodcastStudio(){return __lz(7,'openPodcastStudio',this,arguments)}
function aiModelsInfo(){return __lz(7,'aiModelsInfo',this,arguments)}
function podcastWeek(){return __lz(7,'podcastWeek',this,arguments)}
function matchPreview(){return __lz(7,'matchPreview',this,arguments)}
function matchPreviewAuto(){return __lz(7,'matchPreviewAuto',this,arguments)}
function podcastAutoToggle(){return __lz(7,'podcastAutoToggle',this,arguments)}
function _podOutHtml(){return __lz(7,'_podOutHtml',this,arguments)}
function _podReadForm(){return __lz(7,'_podReadForm',this,arguments)}
function _podLines(){return __lz(7,'_podLines',this,arguments)}
function _podFacts(){return __lz(7,'_podFacts',this,arguments)}
function podWriteScript(){return __lz(7,'podWriteScript',this,arguments)}
function _pcmToWav(){return __lz(7,'_pcmToWav',this,arguments)}
function podRecord(){return __lz(7,'podRecord',this,arguments)}
function _podMp3(){return __lz(7,'_podMp3',this,arguments)}
function podDownload(){return __lz(7,'podDownload',this,arguments)}
function podToDiscord(){return __lz(7,'podToDiscord',this,arguments)}

function podCopyLink(){return __lz(7,'podCopyLink',this,arguments)}
function _podFocus(){return __lz(7,'_podFocus',this,arguments)}
function renderPodcastView(){return __lz(7,'renderPodcastView',this,arguments)}
function podUploadFile(){return __lz(7,'podUploadFile',this,arguments)}
function podSaveLinks(){return __lz(7,'podSaveLinks',this,arguments)}
function podDeleteEp(){return __lz(7,'podDeleteEp',this,arguments)}

function _shortFacts(){return __lz(7,'_shortFacts',this,arguments)}
// 🎬 TOP AKCJE TYGODNIA — 5 najczęściej polubionych akcji kolejki, nagranie 1080×1920 w przeglądarce
const _tcLikes = c => Array.isArray(c.likes) ? c.likes.length : (+c.likes || 0);
function _topClipsOf(){return __lz(7,'_topClipsOf',this,arguments)}
function openTopClipsMaker(){return __lz(7,'openTopClipsMaker',this,arguments)}
function topClipsRecord(){return __lz(7,'topClipsRecord',this,arguments)}
function topClipsSend(){return __lz(7,'topClipsSend',this,arguments)}

function openShortMaker(){return __lz(7,'openShortMaker',this,arguments)}
const SHORT_LEN = 40;
function _shortDraw(){return __lz(7,'_shortDraw',this,arguments)}
let _shortAnim = null;
function shortPreview(){return __lz(7,'shortPreview',this,arguments)}
function shortToDiscord(){return __lz(7,'shortToDiscord',this,arguments)}
function shortRecord(){return __lz(7,'shortRecord',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 🧩 2KORDLE — codzienna zagadka: zgadnij zawodnika ligi w 6 próbach
// ═══════════════════════════════════════════════════════════════
const KORDLE_START = '2026-10-22';
const _kDay = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' });
const _kNum = d => Math.round((Date.parse(d + 'T12:00:00Z') - Date.parse(KORDLE_START + 'T12:00:00Z')) / 864e5) + 1;
function _kHash(){return __lz(7,'_kHash',this,arguments)}
// pula: zawodnicy edycji z min. 3 meczami — tylko mecze sprzed dzisiaj, więc odpowiedź nie zmienia się w ciągu dnia
function _kPool() {
  const today = _kDay(), ed = _editionOf(currentSeasonId);
  const by = {};
  _withAllMatches(() => matches.slice()).filter(m => !m.walkover && _editionOf(m.seasonId) === ed && String(m.date) < today).forEach(m => [m.team1, m.team2].forEach(t => (t.players || []).forEach(p => {
    const k = _normNick(p.name); if(!k) return;
    const o = by[k] = by[k] || { name: p.name, names: {}, teams: {}, pos: {}, gp: 0, pts: 0, reb: 0, ast: 0 };
    o.names[p.name] = (o.names[p.name] || 0) + 1; o.teams[t.name] = (o.teams[t.name] || 0) + 1; if(p.pos) o.pos[p.pos] = (o.pos[p.pos] || 0) + 1;
    o.gp++; o.pts += +p.pts || 0; o.reb += +p.reb || 0; o.ast += +p.ast || 0;
  })));
  const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  return Object.entries(by).filter(([, o]) => o.gp >= 3).map(([k, o]) => ({ k, name: top(o.names)[0], team: top(o.teams)[0], pos: top(o.pos)[0] || '?', pos2: top(o.pos)[1] || null,
    gp: o.gp, ppg: Math.round(o.pts / o.gp * 10) / 10, rpg: Math.round(o.reb / o.gp * 10) / 10, apg: Math.round(o.ast / o.gp * 10) / 10 })).sort((a, b) => a.k.localeCompare(b.k));
}
function _kTarget(){return __lz(7,'_kTarget',this,arguments)}
function _kState() { const d = _kDay(); const s = JSON.parse(localStorage.getItem('nba2k_kordle') || '{}'); return s.day === d ? s : { day: d, guesses: [], done: false, sent: false }; }
function _kSave(){return __lz(7,'_kSave',this,arguments)}
function _kStats(){return __lz(7,'_kStats',this,arguments)}
function _kCell(){return __lz(7,'_kCell',this,arguments)}
function renderKordle(){return __lz(7,'renderKordle',this,arguments)}
function _kBoardLoad(){return __lz(7,'_kBoardLoad',this,arguments)}
function _kStatsLine(){return __lz(7,'_kStatsLine',this,arguments)}
function kordleGuess(){return __lz(7,'kordleGuess',this,arguments)}
function kordleShare(){return __lz(7,'kordleShare',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 🏆 WYŚCIG O MVP — ranking kandydatów po każdej kolejce (z trendem)
// ═══════════════════════════════════════════════════════════════
function _mvpRank(untilDate) {
  const sid = currentSeasonId || null;
  const ms = _withAllMatches(() => matches.filter(m => (m.seasonId || null) === sid && !m.walkover && (!untilDate || String(m.date) < untilDate)));
  const teamG = {}, teamW = {}, P = {};
  ms.forEach(m => [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, o]) => {
    const won = +t.score > +o.score; teamG[t.name] = (teamG[t.name] || 0) + 1; if(won) teamW[t.name] = (teamW[t.name] || 0) + 1;
    (t.players || []).forEach(p => { const k = _normNick(p.name); if(!k) return;
      const a = P[k] = P[k] || { name: p.name, team: t.name, gp: 0, gs: 0, pts: 0, reb: 0, ast: 0 };
      a.gp++; a.team = t.name; a.pts += +p.pts || 0; a.reb += +p.reb || 0; a.ast += +p.ast || 0;
      a.gs += (+p.pts || 0) + 0.4 * (+p.fgm || 0) - 0.7 * (+p.fga || 0) + 0.4 * (+p.reb || 0) + 0.7 * (+p.ast || 0) + (+p.stl || 0) + (+p.blk || 0) - (+p.to || 0); });
  }));
  return Object.values(P).filter(a => a.gp >= Math.max(2, (teamG[a.team] || 0) * 0.5)).map(a => {
    const wp = (teamW[a.team] || 0) / (teamG[a.team] || 1);
    return { ...a, wp, score: Math.round((a.gs / a.gp + wp * 8) * 10) / 10, ppg: a.pts / a.gp, rpg: a.reb / a.gp, apg: a.ast / a.gp, tw: teamW[a.team] || 0, tl: (teamG[a.team] || 0) - (teamW[a.team] || 0) };
  }).sort((x, y) => y.score - x.score);
}
function _mvpHtml(limit = 5, full) {
  const sid = currentSeasonId || null;
  const weeks = [...new Set(schedule.filter(s => s.generated && (s.seasonId || null) === sid && s.weekStart).map(s => s.weekStart))].sort();
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' });
  const curWs = weeks.filter(w => w <= today).pop();
  const now = _mvpRank(), prev = curWs ? _mvpRank(curWs) : [];
  if(!now.length) return '';
  const f1 = v => (Math.round(v * 10) / 10).toFixed(1);
  const pred = predictionsData?.[sid]?.counts?.mvp || {};
  const predTop = Object.entries(pred).sort((a, b) => b[1] - a[1])[0];
  const why = (x, i) => i === 0 ? (x.wp >= .7 ? 'lider ligi i jego drużyna wygrywa' : 'najlepsze liczby w lidze') : x.ppg >= 20 ? 'maszyna do punktów' : x.apg >= 7 ? 'mózg zespołu' : x.rpg >= 10 ? 'pan od tablic' : x.wp >= .7 ? 'wygrywa i dowozi' : 'solidnie w czołówce';
  return `<div class="card" style="padding:.8rem 1rem;margin:0 0 1rem">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem">
      <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted)">🏆 WYŚCIG O MVP SEZONU</div>
      ${full ? '' : `<a href="#" onclick="openMvpRace();return false" style="font-size:.72rem;color:var(--accent)">cały ranking →</a>`}
    </div>
    ${now.slice(0, limit).map((x, i) => { const pi = prev.findIndex(p => _normNick(p.name) === _normNick(x.name)); const d = pi < 0 ? null : pi - i;
      return `<div onclick="openPlayerModal(this.dataset.p,this.dataset.t)" data-p="${_h(x.name)}" data-t="${_h(x.team)}" style="cursor:pointer;display:grid;grid-template-columns:28px 1fr auto 46px;gap:.5rem;align-items:center;padding:.35rem 0;border-bottom:1px solid var(--border)">
        <b style="font-family:'Barlow Condensed',sans-serif;font-size:1.15rem;color:${i < 3 ? 'var(--accent)' : 'var(--muted)'}">${i + 1}</b>
        <div style="min-width:0"><div style="font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(x.name)} <span style="font-size:.7rem;color:var(--muted);font-weight:600">${_h(x.team)} ${x.tw}-${x.tl}</span></div>
          <div style="font-size:.7rem;color:var(--muted)">${f1(x.ppg)} pkt · ${f1(x.rpg)} zb. · ${f1(x.apg)} as. · ${why(x, i)}</div></div>
        <b style="font-family:'Barlow Condensed',sans-serif;color:var(--accent)">${x.score}</b>
        <span style="font-size:.72rem;text-align:right;color:${d > 0 ? 'var(--win)' : d < 0 ? 'var(--loss)' : 'var(--muted)'}">${d === null ? '🆕' : d > 0 ? '▲' + d : d < 0 ? '▼' + -d : '•'}</span></div>`; }).join('')}
    <div style="font-size:.66rem;color:var(--muted);margin-top:.4rem">Ocena = średnia „game score” na mecz + bonus za wygrane drużyny · min. połowa meczów drużyny · ▲▼ zmiana od początku tygodnia${predTop ? ` · typ kibiców przed sezonem: <b>${_h(predTop[0])}</b>` : ''}</div>
  </div>`;
}
function openMvpRace(){return __lz(7,'openMvpRace',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 🏅 WYZWANIA MIESIĄCA (Mój panel) — admin może wyłączyć
// ═══════════════════════════════════════════════════════════════
function _mpFansFill() { const el = document.getElementById('mp-fans'); if(!el || !discordUser) return; _fansLoad().then(d => { if(!d) return; const me = d.fans.find(f => f.id === discordUser.id); el.innerHTML = `<div style="margin-top:.8rem">${_fansMeHtml(me, me ? d.fans.indexOf(me) + 1 : null, d)}</div>`; }); }
function _challengesHtml() { setTimeout(_mpFansFill, 0);
  if(!discordUser || window._challengesOff) return '';
  const month = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' }).slice(0, 7);
  const monthName = new Date().toLocaleDateString(currentLang === 'en' ? 'en-GB' : 'pl-PL', { month: 'long', timeZone: 'Europe/Warsaw' });
  const me = typeof _myPlayerName === 'function' ? _myPlayerName() : null;
  const list = [];
  if(me) {
    const games = _withAllMatches(() => matches.filter(m => String(m.date).startsWith(month) && !m.walkover)).flatMap(m => [m.team1, m.team2]).flatMap(t => (t.players || []).filter(p => _mpSame(p.name, me)));
    const dd = games.filter(p => ['pts', 'reb', 'ast', 'stl', 'blk'].filter(k => (+p[k] || 0) >= 10).length >= 2).length;
    list.push({ ico: '🏀', t: 'Zagraj 4 mecze ligowe', v: games.length, max: 4 }, { ico: '🔺', t: 'Zrób double-double', v: dd, max: 1 });
  }
  const ctx = { demo: false };
  const hits = schedule.filter(s => s.generated && myVotes[String(s.id)]).filter(s => { const r = _ssResult(ctx, s); if(!r?.done) return false; const d = String(s.date || ''); return d.startsWith(month) && myVotes[String(s.id)] === (r.winnerSide || (r.draw ? 'draw' : null)); }).length;
  list.push({ ico: '🎯', t: 'Traf 3 typy w typerze', v: hits, max: 3 });
  const ks = JSON.parse(localStorage.getItem('nba2k_kordle_month') || '{}');
  list.push({ ico: '🧩', t: 'Odgadnij 5 zagadek 2Kordle', v: ks[month] || 0, max: 5 });
  const fx = fantasyData?.season?.find(x => x.id === discordUser.id);
  const fxBest = fx ? Math.max(0, ...Object.values(fx.perWeek || {})) : 0;
  if(fantasyData?.season) list.push({ ico: '🏆', t: 'Kolejka fantasy za 100+ pkt', v: fxBest >= 100 ? 1 : 0, max: 1 });
  const done = list.filter(x => x.v >= x.max).length, all = done === list.length;
  return `<div style="background:var(--surface2);border:1px solid ${all ? 'var(--accent)' : 'var(--border)'};border-radius:10px;padding:.7rem .85rem;margin-top:.8rem">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.45rem">
      <div style="font-size:.68rem;font-weight:800;letter-spacing:1px;color:var(--muted)">🏅 WYZWANIA — ${_h(monthName.toUpperCase())} · ${done}/${list.length}</div>
      ${all ? '<span style="font-size:.74rem;font-weight:800;color:var(--accent)">🏅 Odznaka miesiąca zdobyta!</span>' : ''}
      ${_isLoggedInSync() ? `<a href="#" onclick="toggleChallenges();return false" style="font-size:.66rem;color:var(--muted)">wyłącz wyzwania</a>` : ''}
    </div>
    ${list.map(x => `<div style="display:grid;grid-template-columns:22px 1fr 60px;gap:.5rem;align-items:center;margin:.25rem 0;font-size:.8rem">
      <span>${x.v >= x.max ? '✅' : x.ico}</span><span style="${x.v >= x.max ? 'color:var(--muted);text-decoration:line-through' : ''}">${x.t}</span>
      <div style="height:6px;border-radius:3px;background:var(--surface);overflow:hidden" title="${Math.min(x.v, x.max)}/${x.max}"><div style="height:100%;width:${Math.min(100, x.v / x.max * 100)}%;background:${x.v >= x.max ? 'var(--win)' : 'var(--accent)'}"></div></div></div>`).join('')}
  </div>`;
}
function toggleChallenges(){return __lz(8,'toggleChallenges',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 🖼 PODSUMOWANIE KOLEJKI — grafiki 1600×900 pod Twittera (na żądanie, panel admina)
// ═══════════════════════════════════════════════════════════════
let _wgLang = 'pl';
const _wgT = (pl, en) => _wgLang === 'en' ? en : pl;
const _wgGames = n => _wgLang === 'en' ? (n === 1 ? 'GAME' : 'GAMES') : _plPL(n, 'MECZ', 'MECZE', 'MECZÓW');
const WG_ACCENTS = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16'];
function _wgData(){return __lz(8,'_wgData',this,arguments)}
const _wgNum = v => { const r = Math.round(v * 10) / 10; return Number.isInteger(r) ? String(r) : (_wgLang === 'en' ? r.toFixed(1) : r.toFixed(1).replace('.', ',')); };
const _wgPct = (a, b) => b ? Math.round(a / b * 100) + '%' : '—';
// tło: własna grafika (zapamiętana) albo rysowana „Arena” — neonowa hala z obręczami, piłką, reflektorami i parkietem
let _wgBgMode = localStorage.getItem('nba2k_wg_bgmode') || 'arena';
function _wgBackground(){return __lz(8,'_wgBackground',this,arguments)}
function _wgHeader(){return __lz(8,'_wgHeader',this,arguments)}
function _wgRound(){return __lz(8,'_wgRound',this,arguments)}
function _wgFit(){return __lz(8,'_wgFit',this,arguments)}
function _wgLogo(){return __lz(8,'_wgLogo',this,arguments)}
function _wgSeriesImage(){return __lz(8,'_wgSeriesImage',this,arguments)}
function _wgFactsImage(){return __lz(8,'_wgFactsImage',this,arguments)}
function _wgTweet(){return __lz(8,'_wgTweet',this,arguments)}
function openWeekGraphics(){return __lz(8,'openWeekGraphics',this,arguments)}
function weekGraphicsGen(){return __lz(8,'weekGraphicsGen',this,arguments)}
function xSettingsSave(){return __lz(8,'xSettingsSave',this,arguments)}
function xCheck(){return __lz(8,'xCheck',this,arguments)}
function xPublishNow(){return __lz(8,'xPublishNow',this,arguments)}
function weekGraphicsBot(){return __lz(8,'weekGraphicsBot',this,arguments)}
function wgBgMode(){return __lz(8,'wgBgMode',this,arguments)}
function wgBgUpload(){return __lz(8,'wgBgUpload',this,arguments)}
function weekGraphicDiscord(){return __lz(8,'weekGraphicDiscord',this,arguments)}


// adaptery przeglądarki dla wspólnego kodu karty
const SITE_HOST = (location.host || 'chemikleagues.com').replace(/^www\./, '');
const __mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const __encode = async c => c.toDataURL('image/png');
// <<PCARD — karta gracza (wspólny kod strony i bota)
// zakres „tydzień”: 'week:<sezon>:<numer kolejki>' — mecze z okna tej kolejki
function _pcMatch(scope) { return typeof scope === 'string' && scope.startsWith('match:') ? scope.slice(6) : null; }
function _pcWeek(scope) {
  if(typeof scope !== 'string' || !scope.startsWith('week:')) return null;
  const [, s2, w] = scope.split(':'), sid2 = s2 || null, all = (typeof schedule !== 'undefined' ? schedule : []).filter(x => (x.seasonId || null) === sid2 && +x.week === +w), sch = all.find(x => x.weekStart);
  const ids = new Set(all.flatMap(x => [...(x.matchIds || []), ...(x.matchId != null ? [x.matchId] : [])]).map(String)); // mecze przypisane do tej kolejki w terminarzu (jak nagrody i Piątka tygodnia)
  if(!sch && !ids.size) return null; const e = sch ? new Date(sch.weekStart + 'T12:00:00Z') : null; if(e) e.setUTCDate(e.getUTCDate() + 7);
  return { sid: sid2, w: +w, from: sch?.weekStart || '', to: e ? e.toISOString().slice(0, 10) : '', ids };
}
function _pcWeekHas(wk, m) { return wk.ids?.size ? wk.ids.has(String(m.id)) : (m.seasonId || null) === wk.sid && String(m.date) >= wk.from && String(m.date) < wk.to; }
function _pcData(name, scope = 'season') {
  const key = _normNick(name), sid = currentSeasonId || null;
  const edOf = id => { const m = _seasonName(id).match(/2k\s*(\d{2})/i); return m ? 'NBA 2K' + m[1] : (_seasonName(id) || ''); };
  const all = _withAllMatches(() => matches.slice()).filter(m => !m.walkover);
  const mine = (pool) => pool.map(m => { for(const [t, o] of [[m.team1, m.team2], [m.team2, m.team1]]) { const p = (t.players || []).find(x => _normNick(x.name) === key); if(p) return { p, t, o, m, won: +t.score > +o.score }; } return null; }).filter(Boolean);
  const wk = _pcWeek(scope), mid = _pcMatch(scope), mm = mid ? all.find(m => String(m.id) === String(mid)) : null;
  const pool = mm ? [mm] : wk ? all.filter(m => _pcWeekHas(wk, m)) : scope === 'career' ? all : scope === 'edition' ? all.filter(m => edOf(m.seasonId) === edOf(sid)) : all.filter(m => (m.seasonId || null) === sid);
  const games = mine(pool);
  const scopeLbl = mm ? `${String(mm.date || '').split('-').reverse().join('.')} · vs ${mm.team1.players?.some(p => _normNick(p.name) === _normNick(name)) ? mm.team2.name : mm.team1.name}|${String(mm.date || '').split('-').reverse().join('.')} · vs ${mm.team1.players?.some(p => _normNick(p.name) === _normNick(name)) ? mm.team2.name : mm.team1.name}` : wk ? `WEEK ${wk.w} · ${_seasonName(wk.sid) || ''}|WEEK ${wk.w} · ${_seasonName(wk.sid) || ''}` : scope === 'career' ? 'KARIERA|CAREER' : scope === 'edition' ? edOf(sid) || 'EDYCJA|EDITION' : _seasonName(sid) || 'SEZON|SEASON';
  if(!games.length) return null;
  const sum = f => games.reduce((n, g) => n + (+g.p[f] || 0), 0), gp = games.length;
  const teams = {}; games.forEach(g => { teams[g.t.name] = (teams[g.t.name] || 0) + 1; });
  const team = Object.entries(teams).sort((a, b) => b[1] - a[1])[0][0];
  const pos = {}; games.forEach(g => { if(g.p.pos) pos[g.p.pos] = (pos[g.p.pos] || 0) + 1; });
  const gs = g => (+g.p.pts || 0) + 0.4 * (+g.p.fgm || 0) - 0.7 * (+g.p.fga || 0) + 0.4 * (+g.p.reb || 0) + 0.7 * (+g.p.ast || 0) + (+g.p.stl || 0) + (+g.p.blk || 0) - (+g.p.to || 0);
  const avgGs = games.reduce((n, g) => n + gs(g), 0) / gp;
  const rating = Math.max(50, Math.min(99, Math.round(58 + avgGs * 1.55)));
  const tier = rating >= 92 ? ['GALAKTYKA', 'GALAXY', '#a855f7', '#22d3ee'] : rating >= 86 ? ['DIAMENT', 'DIAMOND', '#38bdf8', '#e0f2fe'] : rating >= 79 ? ['ZŁOTO', 'GOLD', '#f5c518', '#fff3b0'] : rating >= 70 ? ['SREBRO', 'SILVER', '#cbd5e1', '#f8fafc'] : ['BRĄZ', 'BRONZE', '#d08b4f', '#f3c9a3'];
  const tens = p => ['pts', 'reb', 'ast', 'stl', 'blk'].filter(k => (+p[k] || 0) >= 10).length;
  const best = [...games].sort((a, b) => gs(b) - gs(a))[0];
  const prof = (typeof playersList !== 'undefined' ? playersList : []).find(p => p.gamertag && _normNick(p.gamertag) === key);
  const av = prof?.avatar ? (/^https?:/.test(prof.avatar) ? prof.avatar : `https://cdn.discordapp.com/avatars/${prof.id}/${prof.avatar}.png?size=256`) : null;
  let sk = null; try { sk = _pcSkills(name, scope, games); } catch(e) {}
  return { sk, avatar: av, name: best.p.name, team, pos: Object.entries(pos).sort((a, b) => b[1] - a[1]).map(x => x[0]).slice(0, 2).join('/') || '—', scope: scopeLbl, gp,
    w: games.filter(g => g.won).length, ppg: sum('pts') / gp, rpg: sum('reb') / gp, apg: sum('ast') / gp, spg: sum('stl') / gp, bpg: sum('blk') / gp, tpg: sum('to') / gp,
    fg: sum('fga') ? sum('fgm') / sum('fga') : null, tp: sum('tpa') ? sum('tpm') / sum('tpa') : null, rating, tier,
    dd: games.filter(g => tens(g.p) === 2).length, td: games.filter(g => tens(g.p) >= 3).length, high: Math.max(...games.map(g => +g.p.pts || 0)),
    best: { line: `${+best.p.pts || 0} PTS · ${+best.p.reb || 0} REB · ${+best.p.ast || 0} AST`, vs: best.o.name, score: `${+best.t.score || 0}:${+best.o.score || 0}` } };
}
// ── 📊 umiejętności (A+…F względem ligi), 🏅 odznaki, 🧬 archetyp, 🔥 forma ──
const _PC_GR = [[.95, 'A+'], [.88, 'A'], [.80, 'A-'], [.70, 'B+'], [.60, 'B'], [.50, 'B-'], [.40, 'C+'], [.30, 'C'], [.22, 'C-'], [.15, 'D+'], [.09, 'D'], [.04, 'D-'], [-1, 'F']];
const _PC_SK = [['shoot', '🎯', 'RZUT', 'SHOOT'], ['three', '🏹', 'ZA 3', '3PT'], ['inside', '🏀', 'POD KOSZEM', 'INSIDE'], ['play', '🧠', 'ROZGRYWANIE', 'PLAYMAKING'], ['def', '🛡️', 'OBRONA', 'DEFENSE'], ['reb', '💪', 'ZBIÓRKI', 'REBOUND'], ['ball', '🔒', 'KONTROLA', 'BALL CTRL']];
const _PC_GCOL = g => g[0] === 'A' ? '#22c55e' : g[0] === 'B' ? '#a3e635' : g[0] === 'C' ? '#f5c518' : g[0] === 'D' ? '#f97316' : '#ef4444';
let _pcLgCache = {};
function _pcLeague(scope) {
  const sid = currentSeasonId || null, all = _withAllMatches(() => matches.slice()).filter(m => !m.walkover);
  const edOf = id => { const m = _seasonName(id).match(/2k\s*(\d{2})/i); return m ? 'NBA 2K' + m[1] : (_seasonName(id) || ''); };
  const wk = _pcWeek(scope), _mid = _pcMatch(scope); if(_mid) { const _m = all.find(m => String(m.id) === String(_mid)); if(_m) scope = 'season'; }
  const pool = wk ? all.filter(m => _pcWeekHas(wk, m)) : scope === 'career' ? all : scope === 'edition' ? all.filter(m => edOf(m.seasonId) === edOf(sid)) : all.filter(m => (m.seasonId || null) === sid);
  const key = scope + ':' + sid + ':' + all.length; if(_pcLgCache[key]) return _pcLgCache[key];
  const P = {};
  pool.forEach(m => [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, o]) => (t.players || []).forEach(p => {
    const k = _normNick(p.name), x = P[k] = P[k] || { gp: 0, w: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, dd: 0 };
    x.gp++; if(+t.score > +o.score) x.w++; ['pts', 'reb', 'ast', 'stl', 'blk', 'to', 'fgm', 'fga', 'tpm', 'tpa'].forEach(f => x[f] += +p[f] || 0);
    if(['pts', 'reb', 'ast', 'stl', 'blk'].filter(f => (+p[f] || 0) >= 10).length >= 2) x.dd++;
  })));
  const T = Object.values(P).reduce((a, x) => { ['fgm', 'fga', 'tpm', 'tpa'].forEach(f => a[f] += x[f]); return a; }, { fgm: 0, fga: 0, tpm: 0, tpa: 0 });
  const lg = { fg: T.fga ? T.fgm / T.fga : .45, tp: T.tpa ? T.tpm / T.tpa : .33, two: (T.fga - T.tpa) ? (T.fgm - T.tpm) / (T.fga - T.tpa) : .5 };
  const raw = x => { const g = x.gp || 1;
    return { fg: (x.fgm + 10 * lg.fg) / (x.fga + 10), ppg: x.pts / g, tp: (x.tpm + 8 * lg.tp) / (x.tpa + 8), tpa: x.tpa / g, two: (x.fgm - x.tpm + 10 * lg.two) / (x.fga - x.tpa + 10), twom: (x.fgm - x.tpm) / g,
      apg: x.ast / g, ato: x.ast / Math.max(x.to, 1), def: (x.stl + x.blk) / g, rpg: x.reb / g, ball: (x.fga + x.ast) / g / Math.max(x.to / g, .5) }; };
  const R = Object.fromEntries(Object.entries(P).map(([k, x]) => [k, raw(x)])), ref = Object.entries(P).filter(([, x]) => x.gp >= 3).map(([k]) => R[k]);
  const pct = (f, v) => { const arr = (ref.length >= 5 ? ref : Object.values(R)).map(r => r[f]); if(!arr.length) return .5; let lo = 0, eq = 0; arr.forEach(a => { if(a < v) lo++; else if(a === v) eq++; }); return (lo + eq / 2) / arr.length; };
  return _pcLgCache[key] = { P, R, pct };
}
function _pcSkills(name, scope, games) {
  const L = _pcLeague(scope), k = _normNick(name), x = L.P[k], r = L.R[k]; if(!x || !r) return null;
  const c = { shoot: .6 * L.pct('fg', r.fg) + .4 * L.pct('ppg', r.ppg), three: .7 * L.pct('tp', r.tp) + .3 * L.pct('tpa', r.tpa), inside: .7 * L.pct('two', r.two) + .3 * L.pct('twom', r.twom),
    play: .7 * L.pct('apg', r.apg) + .3 * L.pct('ato', r.ato), def: L.pct('def', r.def), reb: L.pct('rpg', r.rpg), ball: L.pct('ball', r.ball) };
  const grade = p => _PC_GR.find(([t]) => p >= t)[1];
  const attrs = Object.fromEntries(Object.entries(c).map(([kk, p]) => [kk, { p, g: grade(p) }]));
  // 🏅 odznaki: 1 brąz · 2 srebro · 3 złoto · 4 Hall of Fame
  const g = x.gp || 1, lvl = (v, th) => th.filter(t => v >= t).length, tp3 = x.tpa ? x.tpm / x.tpa : 0;
  const B = [['sniper', '🔥', 'Snajper', 'Sniper', x.tpa / g >= 3 ? lvl(tp3, [.35, .38, .42, .46]) : 0], ['scorer', '🏀', 'Punktowa maszyna', 'Bucket getter', lvl(x.pts / g, [15, 20, 25, 30])],
    ['thief', '🧤', 'Złodziej', 'Pickpocket', lvl(x.stl / g, [1.5, 2.2, 3, 4])], ['rim', '🚫', 'Obrońca obręczy', 'Rim protector', lvl(x.blk / g, [1, 1.6, 2.3, 3])],
    ['dime', '🪄', 'Kreator', 'Dimer', lvl(x.ast / g, [5, 7, 9, 11])], ['glass', '🧲', 'Czyściciel tablic', 'Glass cleaner', lvl(x.reb / g, [7, 9, 11, 13])],
    ['dd', '💯', 'Double-double', 'Double-double', x.gp >= 3 ? lvl(x.dd / g, [.25, .4, .6, .8]) : 0], ['winner', '🏆', 'Zwycięzca', 'Winner', x.gp >= 5 ? lvl(x.w / g, [.55, .65, .75, .85]) : 0],
    ['iron', '🦾', 'Żelazny', 'Iron man', lvl(x.gp, [10, 20, 35, 50])]].filter(b => b[4] > 0).map(([key, icon, pl, en, l]) => ({ key, icon, pl, en, l })).sort((a, b) => b.l - a.l);
  // 🧬 archetyp
  const A = kk => attrs[kk].p, hi = kk => A(kk) >= .8, ok = kk => A(kk) >= .6;
  const arch = hi('three') && ok('def') ? ['Strzelec 3&D', '3&D wing'] : hi('play') && (ok('shoot') || ok('three')) ? ['Rozgrywający-strzelec', 'Shot-creating playmaker'] : hi('play') ? ['Kreator gry', 'Playmaker']
    : hi('inside') && hi('reb') ? ['Siłacz spod kosza', 'Paint beast'] : hi('def') && ok('reb') ? ['Kotwica obrony', 'Defensive anchor'] : hi('shoot') && ok('three') ? ['Snajper', 'Sharpshooter']
    : Object.values(attrs).filter(a => a.p >= .7).length >= 5 ? ['Wszechstronny', 'All-around'] : hi('reb') ? ['Zbierający', 'Rebounder'] : hi('def') ? ['Obrońca', 'Lockdown defender']
    : hi('inside') ? ['Wykańczający', 'Finisher'] : hi('shoot') ? ['Strzelec', 'Scorer'] : ['Zadaniowiec', 'Role player'];
  // 🔥 forma: 3 ostatnie mecze vs średnia
  const gsOf = q => (+q.p.pts || 0) + 0.4 * (+q.p.fgm || 0) - 0.7 * (+q.p.fga || 0) + 0.4 * (+q.p.reb || 0) + 0.7 * (+q.p.ast || 0) + (+q.p.stl || 0) + (+q.p.blk || 0) - (+q.p.to || 0);
  const srt = [...games].sort((a, b) => String(a.m.date || '').localeCompare(String(b.m.date || ''))), avg = srt.reduce((s, q) => s + gsOf(q), 0) / Math.max(1, srt.length), last = srt.slice(-3), la = last.reduce((s, q) => s + gsOf(q), 0) / Math.max(1, last.length);
  const form = srt.length < 4 ? null : la >= avg * 1.15 + .5 ? { icon: '🔥', pl: 'W formie', en: 'Hot' } : la <= avg * .85 - .5 ? { icon: '❄️', pl: 'Bez formy', en: 'Cold' } : { icon: '➡️', pl: 'Stabilnie', en: 'Steady' };
  return { attrs, badges: B, arch: { pl: arch[0], en: arch[1] }, form, few: x.gp < 3 };
}
function _pcImage(){return __lz(8,'_pcImage',this,arguments)}
function _shareUrl(){return __lz(8,'_shareUrl',this,arguments)}
function shareLink(){return __lz(8,'shareLink',this,arguments)}

function openPlayerCardImg(){return __lz(8,'openPlayerCardImg',this,arguments)}
function pcRender(){return __lz(8,'pcRender',this,arguments)}
function pcToDiscord(){return __lz(8,'pcToDiscord',this,arguments)}

// ═══ 🔁 OKNO TRANSFEROWE — propozycje wymian (kapitanowie) i zatwierdzanie (admin) ═══
let _tradesState = { window: { active: false }, trades: [] };
function _tradesLoad(){return __lz(8,'_tradesLoad',this,arguments)}
function _myCapReg() { return discordUser ? teamRegistrations.find(r => r.status === 'approved' && r.captain?.id === discordUser.id && (!r.seasonId || r.seasonId === (currentSeasonId || r.seasonId))) : null; }
function openTrades(){return __lz(8,'openTrades',this,arguments)}
function renderTrades(){return __lz(8,'renderTrades',this,arguments)}
function _emoHtml(){return __lz(8,'_emoHtml',this,arguments)}
function renderTradeTargets(){return __lz(8,'renderTradeTargets',this,arguments)}
function tradePropose(){return __lz(8,'tradePropose',this,arguments)}
function tradeAct(){return __lz(8,'tradeAct',this,arguments)}
function tradeWindow(){return __lz(8,'tradeWindow',this,arguments)}

function _galaFacts(){return __lz(8,'_galaFacts',this,arguments)}
function _galaImage(){return __lz(8,'_galaImage',this,arguments)}
function _lastGala(){return __lz(8,'_lastGala',this,arguments)}
function galaBoard(){return __lz(8,'galaBoard',this,arguments)}
function galaPodcast(){return __lz(8,'galaPodcast',this,arguments)}

function renderJobsBox(){return __lz(8,'renderJobsBox',this,arguments)}
function openHealth(){return __lz(8,'openHealth',this,arguments)}

function openFaConflicts(){return __lz(8,'openFaConflicts',this,arguments)}
function _faConDraw(){return __lz(8,'_faConDraw',this,arguments)}
function faConResolve(){return __lz(8,'faConResolve',this,arguments)}
// ═══ 📜 REGULAMIN TERMINÓW ═══
const _DAYS = ['', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];
function openRules(){return __lz(8,'openRules',this,arguments)}
function rulesSave(){return __lz(8,'rulesSave',this,arguments)}
function rulesResolve(){return __lz(8,'rulesResolve',this,arguments)}
function rulesExtend(){return __lz(8,'rulesExtend',this,arguments)}

// ═══ 🏅 LIGA KIBICÓW ═══
let _fansCache = null;
function _fansLoad(){return __lz(8,'_fansLoad',this,arguments)}
// 🎟️ PRZEPUSTKA SEZONOWA — drabinka 20 poziomów z XP Ligi kibiców
let _pass = null;
function passMount(){return __lz(8,'passMount',this,arguments)}
function openPackEconomy(){return __lz(8,'openPackEconomy',this,arguments)}
function passAdminToggle(){return __lz(8,'passAdminToggle',this,arguments)}
function passClaim(){return __lz(8,'passClaim',this,arguments)}

function renderFansView(){return __lz(8,'renderFansView',this,arguments)}
function _fansMeHtml(me, pos, d) {
  if(!discordUser) return `<div class="card" style="padding:.8rem 1rem;margin-bottom:1rem;font-size:.82rem">Zaloguj się przez Discord, żeby zbierać punkty kibica i awansować.</div>`;
  if(!me) return `<div class="card" style="padding:.8rem 1rem;margin-bottom:1rem;font-size:.82rem">Nie masz jeszcze punktów — wytypuj mecz, zagraj w 2Kordle albo zbuduj skład fantasy 🎯</div>`;
  const l = me.level, pct = l.next ? Math.min(100, Math.round((me.xp - l.from) / (l.next - l.from) * 100)) : 100;
  return `<div class="card" style="padding:.8rem 1rem;margin-bottom:1rem;border-color:var(--accent)">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:.5rem;flex-wrap:wrap"><b style="font-size:1.05rem">🏅 ${_h(l.name)}</b><span style="font-size:.8rem;color:var(--muted)">${me.xp} XP · ${pos}. miejsce z ${d.fans.length}</span></div>
    <div style="height:10px;border-radius:5px;background:var(--surface2);overflow:hidden;margin:.45rem 0 .25rem"><div style="height:100%;width:${pct}%;background:var(--accent)"></div></div>
    <div style="font-size:.72rem;color:var(--muted)">${l.next ? `Do poziomu „${_h(d.levels[l.idx + 1][1])}”: ${l.next - me.xp} XP` : 'Najwyższy poziom — Legenda ligi! 👑'}</div></div>`;
}

// ═══ 🏆 LIGA GM (Fantasy+) — ustawienia i zapisy ═══
// W BUDOWIE: false = Liga GM widoczna tylko dla admina (menu, ☰ Więcej, Dashboard, #liga-gm). Ustaw true, żeby pokazać ją wszystkim.
var GM_LEAGUE_PUBLIC = false;
function _gmVisible() { return GM_LEAGUE_PUBLIC || _isLoggedInSync(); }
function _gmNavSync(){return __lz(8,'_gmNavSync',this,arguments)}
function _g(pl, en) { return currentLang === 'en' ? en : pl; }
let _gmState = null;
function _gmLoad(){return __lz(8,'_gmLoad',this,arguments)}
function _gmPool() {
  const sid = currentSeasonId || null, set = new Map();
  teamRegistrations.filter(r => r.status === 'approved' && (!r.seasonId || r.seasonId === (sid || r.seasonId))).forEach(r => (r.players || []).forEach(p => { if(p.gamertag) set.set(_normNick(p.gamertag), { name: p.gamertag, team: r.teamName }); }));
  return [...set.values()];
}
function _myGamertag() { const prof = discordUser ? (playersList || []).find(p => p.id === discordUser.id && p.gamertag) : null; return prof?.gamertag || ''; }
function renderGmView(){return __lz(8,'renderGmView',this,arguments)}
function _gmDraftHtml(){return __lz(8,'_gmDraftHtml',this,arguments)}
function _gmAdminHtml(){return __lz(8,'_gmAdminHtml',this,arguments)}
function gmCalc() {
  const el = document.getElementById('gmc-calc'); if(!el) return;
  const pool = _gmPool().length, roster = +document.getElementById('gmc-roster').value || 6, max = +document.getElementById('gmc-max').value || 2, cap = Math.floor(pool / roster);
  const used = Math.min(max, cap) * roster, fa = pool - used;
  el.innerHTML = _g(`🧮 W puli: <b>${pool}</b> zawodników z zatwierdzonych drużyn. Przy składzie <b>${roster}</b> zmieści się maks. <b>${cap}</b> GM-ów. Przy <b>${Math.min(max, cap)}</b> GM-ach w składach będzie ${used} zawodników, a <b>${fa}</b> zostanie wolnymi agentami.${max > cap ? ` <span style="color:var(--loss)">⚠️ Ustawiona liczba GM-ów (${max}) jest większa niż pozwala pula.</span>` : ''}`,
    `🧮 Pool: <b>${pool}</b> players from approved teams. With a roster of <b>${roster}</b>, at most <b>${cap}</b> GMs fit. With <b>${Math.min(max, cap)}</b> GMs, ${used} players will be on rosters and <b>${fa}</b> will be free agents.${max > cap ? ` <span style="color:var(--loss)">⚠️ The GM count (${max}) is higher than the pool allows.</span>` : ''}`);
}
function gmSaveConfig(){return __lz(8,'gmSaveConfig',this,arguments)}
function gmSignup(){return __lz(8,'gmSignup',this,arguments)}
function gmLeave(){return __lz(8,'gmLeave',this,arguments)}
function gmRemove(){return __lz(8,'gmRemove',this,arguments)}

function _gmPoolFull(){return __lz(8,'_gmPoolFull',this,arguments)}
function gmCreateSnake(){return __lz(8,'gmCreateSnake',this,arguments)}
function _gmSaveRosters(){return __lz(8,'_gmSaveRosters',this,arguments)}

// 💰 AUKCJA
let _gma = null, _gmaPoll = null, _gmaTick = null, _gmaOffset = 0;
function _gmaFetch(){return __lz(8,'_gmaFetch',this,arguments)}
function gmCreateAuction(){return __lz(8,'gmCreateAuction',this,arguments)}
function openGmAuction(){return __lz(8,'openGmAuction',this,arguments)}
function closeGmAuction(){return __lz(8,'closeGmAuction',this,arguments)}
const _gmaSlots = (s, g) => s.roster - g.players.length, _gmaMax = (s, g) => _gmaSlots(s, g) > 0 ? g.left - (_gmaSlots(s, g) - 1) : 0;
function _gmaCountdown(){return __lz(8,'_gmaCountdown',this,arguments)}
function renderGmAuction(){return __lz(8,'renderGmAuction',this,arguments)}
function _gmaLotSkills(){return __lz(8,'_gmaLotSkills',this,arguments)}
function gmaNominate(){return __lz(8,'gmaNominate',this,arguments)}
function gmaBid(){return __lz(8,'gmaBid',this,arguments)}
function gmaAdmin(){return __lz(8,'gmaAdmin',this,arguments)}
function gmaFinish(){return __lz(8,'gmaFinish',this,arguments)}

// ═══ 🏆 LIGA GM — sezon: punktacja tygodniowa (najlepsze N z M), pojedynki / suma, tabela, profil drużyny ═══
const _GM_GRADE = { 'A+': 3, 'A': 2.5, 'A-': 2, 'B+': 1.5, 'B': 1, 'B-': 0.5, 'C+': 0, 'C': -0.5, 'C-': -1, 'D+': -1.25, 'D': -1.5, 'D-': -1.75, 'F': -2 };
function _gmFp(){return __lz(8,'_gmFp',this,arguments)}
function _gmSeason(){return __lz(8,'_gmSeason',this,arguments)}
function _gmSeasonHtml(){return __lz(8,'_gmSeasonHtml',this,arguments)}
function _gmPlayoffsHtml(){return __lz(8,'_gmPlayoffsHtml',this,arguments)}
function openGmRosterEdit(){return __lz(8,'openGmRosterEdit',this,arguments)}
function gmReAdd(){return __lz(8,'gmReAdd',this,arguments)}
function gmReSave(){return __lz(8,'gmReSave',this,arguments)}
function gmReTransfer(){return __lz(8,'gmReTransfer',this,arguments)}
function gmAnnounceChampion(){return __lz(8,'gmAnnounceChampion',this,arguments)}
function openGmTeam(){return __lz(8,'openGmTeam',this,arguments)}

// ═══ 🔁 LIGA GM — RYNEK (wymiany i wolni agenci) ═══
let _gmMyBids = null;
function _gmRosterAt(){return __lz(8,'_gmRosterAt',this,arguments)}
function _gmSeasonFp(){return __lz(8,'_gmSeasonFp',this,arguments)}
function _gmMarketHtml(){return __lz(8,'_gmMarketHtml',this,arguments)}
function gmMk(){return __lz(8,'gmMk',this,arguments)}
function gmMkPropose(){return __lz(8,'gmMkPropose',this,arguments)}
function gmMkBid(){return __lz(8,'gmMkBid',this,arguments)}
function gmMkDecide(){return __lz(8,'gmMkDecide',this,arguments)}
function gmMkProcess(){return __lz(8,'gmMkProcess',this,arguments)}
function _gmMyBidsLoad(){return __lz(8,'_gmMyBidsLoad',this,arguments)}

// ═══ 💵 SALARY CAP — pensje, miejsce pod capem; pensje w snake według miejsca w drafcie ═══
const _gmPay = (st, gid) => (st.rosters?.[gid] || []).reduce((s, p) => s + (+p.price || 0), 0) + (st.market?.dead?.[gid] || 0);
const _gmCap = st => st.config.cap ?? st.config.budget ?? 200;
function _gmRookieScale(total, cap, roster) { // pick 1 najdroższy, ostatni = 1; średni skład ≈ 80% capu
  const avg = 0.8 * cap / roster, k = 1.5, max = Math.max(2, Math.round(1 + (avg - 1) * (k + 1)));
  return i => Math.max(1, Math.round(1 + (max - 1) * Math.pow((total - 1 - i) / Math.max(1, total - 1), k)));
}
function _gmSnakeSalaries(ev, st) {
  const c = st.config, total = (ev.draftOrder || []).length, sal = _gmRookieScale(total, _gmCap(st), c.roster), cnt = {}, out = {};
  (ev.teams || []).forEach((t, ti) => { const kc = (ev.keepersCount || [])[ti] || 0; cnt[ti] = kc; out[t.captain?.id] = (t.players || []).slice(0, kc).map(p => ({ name: p.name, team: p.team, price: +p.price || 1 })); });
  (ev.draftOrder || []).forEach((ti, i) => { const t = ev.teams[ti]; if(!t) return; const k = cnt[ti], p = (t.players || [])[k]; cnt[ti]++; if(p) (out[t.captain?.id] = out[t.captain?.id] || []).push({ name: p.name, team: p.team, price: sal(i) }); });
  return out;
}
function _gmIsNew(){return __lz(8,'_gmIsNew',this,arguments)}
function _gmRatingsHtml(){return __lz(8,'_gmRatingsHtml',this,arguments)}
function _gmWeekLines(){return __lz(8,'_gmWeekLines',this,arguments)}
function _gmWeekImage(){return __lz(8,'_gmWeekImage',this,arguments)}
function openGmWeekGraphic(){return __lz(8,'openGmWeekGraphic',this,arguments)}
function gmWgSend(){return __lz(8,'gmWgSend',this,arguments)}

// ═══ 👑 LIGA GM — DYNASTIA: zatrzymani zawodnicy z poprzedniego sezonu ═══
let _gmPrev = null;
function _gmPrevSeasonId(){return __lz(8,'_gmPrevSeasonId',this,arguments)}
function _gmPrevLoad(){return __lz(8,'_gmPrevLoad',this,arguments)}
function _gmKeepersSplit(){return __lz(8,'_gmKeepersSplit',this,arguments)}
function _gmDynastyHtml(){return __lz(8,'_gmDynastyHtml',this,arguments)}
function gmKeepSave(){return __lz(8,'gmKeepSave',this,arguments)}

function _djSrc(){return __lz(8,'_djSrc',this,arguments)}
function _djLabel(url) { try { const p = new URL(url).pathname.split('/').filter(Boolean); return p.length > 1 ? decodeURIComponent(p[p.length - 1]).replace(/[-_]+/g, ' ') : _g('Wszystkie sety', 'All sets'); } catch(e) { return url; } }
function djMount() {
  const dj = window._dj; let btn = document.getElementById('dj-fab');
  if(!dj?.profile && !(dj?.sets || []).length) { btn?.remove(); document.getElementById('dj-panel')?.remove(); return; }
  if(!btn) {
    btn = document.createElement('button'); btn.id = 'dj-fab'; btn.title = '🎧 ' + (dj.name || 'DJ');
    btn.style.cssText = 'position:fixed;left:14px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:880;width:48px;height:48px;border-radius:50%;border:2px solid var(--accent);background:var(--surface);color:var(--text);font-size:1.35rem;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.4)';
    btn.textContent = '🎧'; btn.onclick = djToggle; document.body.appendChild(btn);
    if(_djAuto() && !window._djAutoArmed) {
      window._djAutoArmed = true;
      const go = e => { ['pointerdown', 'keydown'].forEach(t => document.removeEventListener(t, go, true));
        if(e?.target?.closest?.('#dj-fab, #dj-panel') || document.getElementById('dj-panel')) return; // klik w 🎧 obsłuży się sam
        djToggle(); setTimeout(() => { const pn = document.getElementById('dj-panel'); if(pn && pn.dataset.min !== '1') djToggle(); }, 400); };
      ['pointerdown', 'keydown'].forEach(t => document.addEventListener(t, go, true));
    }
  }
}
function _djAuto() { try { return localStorage.getItem('nba2k_dj_auto') === '1'; } catch(e) { return false; } }
function djToggle() {
  const dj = window._dj; let pn = document.getElementById('dj-panel');
  if(pn) { const hide = pn.dataset.min !== '1'; pn.dataset.min = hide ? '1' : '0'; pn.style.transform = hide ? 'translateY(calc(100% + 120px))' : 'none'; document.getElementById('dj-fab').style.borderColor = hide && pn.querySelector('iframe') ? 'var(--win)' : 'var(--accent)'; return; }
  const sources = [...(dj.latest?.link ? [{ url: dj.latest.link, label: '🆕 ' + dj.latest.title }] : []), ...(dj.sets || []).filter(u => u !== dj.latest?.link).map(u => ({ url: u, label: '🎵 ' + _djLabel(u) })), ...(dj.profile ? [{ url: dj.profile, label: '📀 ' + _g('Wszystkie sety', 'All sets') }] : [])];
  let last = null; try { last = localStorage.getItem('nba2k_dj_src'); } catch(e) {}
  const start = sources.find(x => x.url === last)?.url || sources[0]?.url;
  pn = document.createElement('div'); pn.id = 'dj-panel'; pn.dataset.min = '0'; pn.setAttribute('data-notr', '');
  pn.style.cssText = 'position:fixed;left:14px;bottom:calc(140px + env(safe-area-inset-bottom,0px));z-index:881;width:min(360px,calc(100vw - 28px));background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.5);padding:.6rem;transition:transform .25s';
  pn.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:.4rem;margin-bottom:.4rem"><b style="font-size:.85rem">🎧 ${_h(dj.name || 'DJ')}</b>
      <span style="display:flex;gap:.3rem"><button class="btn btn-ghost" style="font-size:.68rem;padding:.1rem .45rem" onclick="djToggle()" title="${_g('Zwiń — muzyka gra dalej', 'Minimise — music keeps playing')}">▾</button><button class="btn btn-ghost" style="font-size:.68rem;padding:.1rem .45rem" onclick="djClose()" title="${_g('Wyłącz', 'Turn off')}">✕</button></span></div>
    <select id="dj-src" onchange="djPlay(this.value)" style="width:100%;font-size:.78rem;padding:.3rem;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--text);margin-bottom:.4rem">${sources.map(s => `<option value="${_h(s.url)}" ${s.url === start ? 'selected' : ''}>${_h(s.label)}</option>`).join('')}</select>
    <div id="dj-frame" style="border-radius:10px;overflow:hidden;min-height:120px;background:var(--surface2)"></div>
    <label style="display:flex;align-items:center;gap:.4rem;font-size:.74rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:.45rem 0 0;cursor:pointer"><input type="checkbox" ${_djAuto() ? 'checked' : ''} onchange="try{localStorage.setItem('nba2k_dj_auto', this.checked ? '1' : '0')}catch(e){}; showToast(this.checked ? _g('▶ Muzyka włączy się sama przy następnej wizycie (po pierwszym kliknięciu na stronie)', '▶ Music will start on your next visit (after your first click on the page)') : _g('Autostart wyłączony', 'Autoplay off'), 'success')" style="width:auto;margin:0;accent-color:var(--accent)"> ${_g('▶ Włączaj muzykę automatycznie na stronie', '▶ Play music automatically on the site')}</label>
    ${dj.profile ? `<a href="${_h(dj.profile)}" target="_blank" rel="noopener" style="display:block;font-size:.7rem;color:var(--muted);margin-top:.35rem;text-align:right">SoundCloud ↗</a>` : ''}`;
  document.body.appendChild(pn);
  if(start) djPlay(start); // od razu gra — bez dodatkowego „Odtwórz”
}
function _scApi(){return __lz(8,'_scApi',this,arguments)}
function djPlay(){return __lz(8,'djPlay',this,arguments)}
function djClose(){return __lz(8,'djClose',this,arguments)}
function openDjSettings(){return __lz(8,'openDjSettings',this,arguments)}
function _djForm(){return __lz(8,'_djForm',this,arguments)}
function djSave(){return __lz(8,'djSave',this,arguments)}
function djTest(){return __lz(8,'djTest',this,arguments)}

// ═══ 🐦 KOLEJKA X — redaktorzy sprawdzają, poprawiają i publikują wpisy przygotowane przez bota ═══
const _xLen = t => [...String(t || '')].reduce((n, ch) => n + (ch.codePointAt(0) > 0x10FF ? 2 : 1), 0);
function _isXEditor(){return __lz(8,'_isXEditor',this,arguments)}
let _xq = [];
function _xqParts(){return __lz(8,'_xqParts',this,arguments)}
const _xqImgUrl = (id, n) => `${workerUrl.replace(/\/+$/, '')}/x-drafts/img/${id}/${n}.jpg`;
function _xqFiles(){return __lz(8,'_xqFiles',this,arguments)}
function xqManual(){return __lz(8,'xqManual',this,arguments)}
function xqmOpen(){return __lz(8,'xqmOpen',this,arguments)}
function xqmCopy(){return __lz(8,'xqmCopy',this,arguments)}
function xqmDownload(){return __lz(8,'xqmDownload',this,arguments)}
function xqmShare(){return __lz(8,'xqmShare',this,arguments)}
function xqmDone(){return __lz(8,'xqmDone',this,arguments)}

function openXQueue(){return __lz(8,'openXQueue',this,arguments)}
function _xqDraw(){return __lz(8,'_xqDraw',this,arguments)}
function _xKnownUsers(){return __lz(8,'_xKnownUsers',this,arguments)}
function _xEditorsHtml(){return __lz(8,'_xEditorsHtml',this,arguments)}
function xEditorsSet(){return __lz(8,'xEditorsSet',this,arguments)}
function xEditorAdd(){return __lz(8,'xEditorAdd',this,arguments)}
function _xqCount(){return __lz(8,'_xqCount',this,arguments)}
function xqAct(){return __lz(8,'xqAct',this,arguments)}

// ═══ 📊 UMIEJĘTNOŚCI w profilu, ⚖️ porównanie kart, mini-oceny dla Ligi GM ═══
function _pcSkFor(name) { for(const sc of ['season', 'edition', 'career']) { const d = _pcData(name, sc); if(d?.sk) return { d, sc }; } return null; }
function _pcSkillsHtml(name) {
  const r = _pcSkFor(name); if(!r) return '';
  const { d } = r, sk = d.sk, L = _pcLeague(r.sc), x = L.P[_normNick(name)] || {}, g = x.gp || 1, f1 = v => (Math.round(v * 10) / 10).toString().replace('.', currentLang === 'en' ? '.' : ',');
  const val = { shoot: `FG ${x.fga ? Math.round(x.fgm / x.fga * 100) : 0}% · ${f1(x.pts / g)} ${_g('pkt', 'pts')}`, three: `${x.tpa ? Math.round(x.tpm / x.tpa * 100) : 0}% · ${f1(x.tpa / g)} ${_g('prób', 'att')}`,
    inside: `${(x.fga - x.tpa) ? Math.round((x.fgm - x.tpm) / (x.fga - x.tpa) * 100) : 0}% ${_g('za 2', '2PT')}`, play: `${f1(x.ast / g)} ${_g('as.', 'ast')} · AST/TO ${f1(x.ast / Math.max(x.to, 1))}`,
    def: `${f1(x.stl / g)} ${_g('prz.', 'stl')} · ${f1(x.blk / g)} ${_g('bl.', 'blk')}`, reb: `${f1(x.reb / g)} ${_g('zb.', 'reb')}`, ball: `${f1(x.to / g)} ${_g('str.', 'tov')}` };
  const LV = ['', '🥉', '🥈', '🥇', '💎'], scL = { season: _g('bieżący sezon', 'current season'), edition: _g('edycja', 'edition'), career: _g('kariera', 'career') }[r.sc];
  return `<div data-notr style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:.7rem .85rem;margin:.6rem 0 .9rem">
    <div style="display:flex;justify-content:space-between;gap:.5rem;flex-wrap:wrap;align-items:baseline"><b>📊 ${_g('Umiejętności', 'Skills')} <span style="font-size:.72rem;color:var(--muted);font-weight:500">· ${_g('na tle ligi', 'vs the league')} · ${scL}${sk.few ? ' · ' + _g('mało meczów', 'few games') : ''}</span></b>
      <span style="font-size:.82rem">🧬 <b>${_h(currentLang === 'en' ? sk.arch.en : sk.arch.pl)}</b>${sk.form ? ` · ${sk.form.icon} ${_h(currentLang === 'en' ? sk.form.en : sk.form.pl)}` : ''}</span></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.4rem;margin-top:.5rem">${_PC_SK.map(([k, ic, pl, en]) => `<div style="background:var(--surface);border-radius:8px;padding:.35rem .5rem;display:flex;justify-content:space-between;align-items:center;gap:.4rem">
      <div><div style="font-size:.72rem;color:var(--muted)">${ic} ${currentLang === 'en' ? en : pl}</div><div style="font-size:.68rem;color:var(--muted)">${val[k]}</div></div><b style="font-family:'Barlow Condensed',sans-serif;font-size:1.5rem;color:${_PC_GCOL(sk.attrs[k].g)}">${sk.attrs[k].g}</b></div>`).join('')}</div>
    ${sk.badges.length ? `<div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.5rem">${sk.badges.map(b => `<span style="font-size:.74rem;background:var(--surface);border-radius:999px;padding:.15rem .55rem">${LV[b.l]} ${b.icon} ${_h(currentLang === 'en' ? b.en : b.pl)}</span>`).join('')}</div>` : ''}
    <div style="font-size:.66rem;color:var(--muted);margin-top:.4rem">${_g('Ocena = miejsce na tle zawodników ligi (min. 3 mecze): A+ to ok. 5% najlepszych. Odznaki: 🥉 brąz · 🥈 srebro · 🥇 złoto · 💎 Hall of Fame.', 'Grade = rank among league players (min. 3 games): A+ is roughly the top 5%. Badges: 🥉 bronze · 🥈 silver · 🥇 gold · 💎 Hall of Fame.')}</div>
  </div>`;
}
function _pcMini(){return __lz(8,'_pcMini',this,arguments)}
function _pcSkSortSel(){return __lz(8,'_pcSkSortSel',this,arguments)}
function _pcSkSort(){return __lz(8,'_pcSkSort',this,arguments)}
// ⚖️ porównanie dwóch kart
function _cmpExtraHtml(a, b, sc) {
  const N = x => _normNick(x), en = currentLang === 'en', sid = currentSeasonId || null;
  const ms = _withAllMatches(() => matches.filter(m => !m.walkover && (sc === 'career' || (m.seasonId || null) === sid))).sort((x, y) => String(y.date).localeCompare(String(x.date)));
  const side = (m, n) => (m.team1.players || []).some(p => N(p.name) === N(n)) ? 'team1' : (m.team2.players || []).some(p => N(p.name) === N(n)) ? 'team2' : null;
  const pl = (m, n) => [...(m.team1.players || []), ...(m.team2.players || [])].find(p => N(p.name) === N(n));
  const vs = [], together = []; ms.forEach(m => { const sa = side(m, a), sb = side(m, b); if(!sa || !sb) return; (sa === sb ? together : vs).push({ m, sa, sb }); });
  const wa = vs.filter(x => (+x.m[x.sa].score || 0) > (+x.m[x.sb].score || 0)).length, date = d => new Date(d).toLocaleDateString(en ? 'en-GB' : 'pl-PL', { day: 'numeric', month: 'short' });
  const form = n => ms.filter(m => side(m, n)).slice(0, 5).map(m => { const s = side(m, n), o = s === 'team1' ? 'team2' : 'team1', w = (+m[s].score || 0) > (+m[o].score || 0), p = pl(m, n);
    return `<span title="${_h(m[o].name)} ${m[s].score}:${m[o].score}" style="display:inline-flex;flex-direction:column;align-items:center;min-width:34px;padding:.15rem .2rem;border-radius:6px;background:${w ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.12)'};font-size:.72rem"><b>${+p?.pts || 0}</b><span style="font-size:.58rem;color:${w ? 'var(--win)' : 'var(--loss)'}">${w ? 'W' : (en ? 'L' : 'P')}</span></span>`; }).join(' ') || '—';
  const H = t => `<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.8rem 0 .3rem">${t}</div>`;
  return H('⚔️ ' + _g('BEZPOŚREDNIE MECZE', 'HEAD TO HEAD')) + (vs.length ? `<div style="font-size:.84rem;margin-bottom:.3rem"><b>${_h(a)}</b> ${wa}–${vs.length - wa} <b>${_h(b)}</b></div>${vs.slice(0, 6).map(x => { const pa = pl(x.m, a), pb = pl(x.m, b); return `<div style="display:flex;justify-content:space-between;gap:.4rem;font-size:.76rem;padding:.2rem 0;border-top:1px solid var(--border)"><span>${date(x.m.date)}</span><span>${_h(x.m[x.sa].name)} <b>${x.m[x.sa].score}:${x.m[x.sb].score}</b> ${_h(x.m[x.sb].name)}</span><span>${+pa?.pts || 0} ${_g('pkt', 'pts')} vs ${+pb?.pts || 0}</span></div>`; }).join('')}`
      : `<div style="font-size:.78rem;color:var(--muted)">${_g('Jeszcze nie grali przeciwko sobie', 'They haven’t faced each other yet')}${sc === 'season' ? _g(' w tym sezonie', ' this season') : ''}.</div>`)
    + (together.length ? `<div style="font-size:.76rem;color:var(--muted);margin-top:.35rem">🤝 ${_g('Razem w jednej drużynie', 'Teammates in')}: <b>${together.length}</b> ${_g(_plPL(together.length, 'mecz', 'mecze', 'meczów'), together.length === 1 ? 'game' : 'games')}</div>` : '')
    + H('📈 ' + _g('FORMA — 5 OSTATNICH MECZÓW (PKT)', 'FORM — LAST 5 GAMES (PTS)')) + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem"><div>${form(a)}</div><div>${form(b)}</div></div>`
    + `<div style="display:flex;gap:.4rem;justify-content:center;margin-top:.8rem"><button class="btn btn-ghost" style="font-size:.7rem" onclick="openPlayerCardImg('${_h(a).replace(/'/g, "\\'")}')">🃏 ${_h(a)}</button><button class="btn btn-ghost" style="font-size:.7rem" onclick="openPlayerCardImg('${_h(b).replace(/'/g, "\\'")}')">🃏 ${_h(b)}</button></div>`;
}
function openCardCompare(a, b) {
  const all = [...new Set(_withAllMatches(() => matches.flatMap(m => [m.team1, m.team2]).flatMap(t => (t.players || []).map(p => p.name))))].sort((x, y) => x.localeCompare(y));
  const m = _fxModal('pccmp-modal', 680); m.classList.add('open');
  const sc = window._pccScope || 'season', pick = n => { if(!n) return null; const d = _pcData(n, sc); return d?.sk ? { d } : (sc === 'season' ? _pcSkFor(n) : null); }, A = pick(a), B = pick(b), f1 = v => (Math.round(v * 10) / 10).toString().replace('.', currentLang === 'en' ? '.' : ',');
  const row = (label, va, vb, na, nb) => { const wa = na != null && nb != null && na > nb, wb = na != null && nb != null && nb > na;
    return `<tr><td style="text-align:right;padding:.3rem .5rem;${wa ? 'color:var(--win);font-weight:800' : ''}">${va}</td><td style="text-align:center;color:var(--muted);font-size:.74rem;padding:.3rem">${label}</td><td style="text-align:left;padding:.3rem .5rem;${wb ? 'color:var(--win);font-weight:800' : ''}">${vb}</td></tr>`; };
  const sel = (id, v) => `<input id="${id}" list="pccmp-list" value="${_h(v || '')}" placeholder="${_g('Wybierz gracza…', 'Pick a player…')}" onchange="openCardCompare(document.getElementById('pccmp-a').value, document.getElementById('pccmp-b').value)" style="${_MODAL_INP};font-size:.82rem">`;
  m.querySelector('.modal').innerHTML = _fxHead('pccmp-modal', '⚖️ ' + _g('Porównanie graczy', 'Player comparison')) + `<div data-notr>
    <div style="display:flex;gap:.3rem;margin-bottom:.45rem">${[['season', _g('Sezon', 'Season')], ['career', _g('Kariera', 'Career')]].map(([k, l]) => `<button class="btn ${sc === k ? 'btn-primary' : 'btn-ghost'}" style="font-size:.68rem;padding:.15rem .5rem" onclick="window._pccScope='${k}';openCardCompare(${JSON.stringify(a || '').replace(/"/g, '&quot;')},${JSON.stringify(b || '').replace(/"/g, '&quot;')})">${l}</button>`).join('')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.6rem">${sel('pccmp-a', a)}${sel('pccmp-b', b)}</div><datalist id="pccmp-list">${all.map(n => `<option value="${_h(n)}">`).join('')}</datalist>
    ${A && B ? `<table style="width:100%;border-collapse:collapse;font-size:.86rem">
      <tr><th style="text-align:right;padding:.3rem .5rem;white-space:normal;vertical-align:top">${_h(A.d.name)}<div style="font-size:.7rem;color:var(--muted);font-weight:500">${_h(A.d.team)} · 🧬 ${_h(currentLang === 'en' ? A.d.sk.arch.en : A.d.sk.arch.pl)}</div></th><th></th><th style="text-align:left;padding:.3rem .5rem;white-space:normal;vertical-align:top">${_h(B.d.name)}<div style="font-size:.7rem;color:var(--muted);font-weight:500">${_h(B.d.team)} · 🧬 ${_h(currentLang === 'en' ? B.d.sk.arch.en : B.d.sk.arch.pl)}</div></th></tr>
      ${row(_g('Ocena', 'Rating'), A.d.rating, B.d.rating, A.d.rating, B.d.rating)}
      ${_PC_SK.map(([k, ic, pl, en]) => row(`${ic} ${currentLang === 'en' ? en : pl}`, `<b style="color:${_PC_GCOL(A.d.sk.attrs[k].g)}">${A.d.sk.attrs[k].g}</b>`, `<b style="color:${_PC_GCOL(B.d.sk.attrs[k].g)}">${B.d.sk.attrs[k].g}</b>`, A.d.sk.attrs[k].p, B.d.sk.attrs[k].p)).join('')}
      ${[['PTS', 'ppg'], [_g('ZB', 'REB'), 'rpg'], [_g('AS', 'AST'), 'apg'], [_g('PRZ', 'STL'), 'spg'], [_g('BL', 'BLK'), 'bpg']].map(([l, k]) => row(l, f1(A.d[k]), f1(B.d[k]), A.d[k], B.d[k])).join('')}
      ${row('FG%', A.d.fg == null ? '—' : Math.round(A.d.fg * 100) + '%', B.d.fg == null ? '—' : Math.round(B.d.fg * 100) + '%', A.d.fg, B.d.fg)}
      ${row(_g('Odznaki', 'Badges'), A.d.sk.badges.length, B.d.sk.badges.length, A.d.sk.badges.length, B.d.sk.badges.length)}
    </table>${_cmpExtraHtml(A.d.name, B.d.name, sc)}` : `<div style="font-size:.84rem;color:var(--muted)">${_g('Wybierz dwóch graczy, żeby porównać ich karty.', 'Pick two players to compare their cards.')}</div>`}
  </div>`;
}

// ═══ 🎬 DRAFT NIGHT — odkrycie karty przy każdym picku / sprzedaży (strona i overlay OBS) ═══
const _dnQ = []; let _dnBusy = false;
function _dnOn(){return __lz(8,'_dnOn',this,arguments)}
function _dnSound(){return __lz(8,'_dnSound',this,arguments)}
function _dnReveal(){return __lz(8,'_dnReveal',this,arguments)}
function _dnNext(){return __lz(8,'_dnNext',this,arguments)}
function _dnOnEvd(){return __lz(8,'_dnOnEvd',this,arguments)}
function _dnOnAuction(){return __lz(8,'_dnOnAuction',this,arguments)}
function startDraftNightOverlay(){return __lz(8,'startDraftNightOverlay',this,arguments)}

function _gmTeamProfile(){return __lz(8,'_gmTeamProfile',this,arguments)}
function _radarSvg(){return __lz(8,'_radarSvg',this,arguments)}
function _gmDraftReportData(){return __lz(8,'_gmDraftReportData',this,arguments)}
function openGmDraftReport(){return __lz(8,'openGmDraftReport',this,arguments)}
function _gmReportImage(){return __lz(8,'_gmReportImage',this,arguments)}
function gmReportSend(){return __lz(8,'gmReportSend',this,arguments)}

function _gmWeeklyVal(){return __lz(8,'_gmWeeklyVal',this,arguments)}
function _gmTradeAnalysisHtml(){return __lz(8,'_gmTradeAnalysisHtml',this,arguments)}
function gmTradeAnalyze(){return __lz(8,'gmTradeAnalyze',this,arguments)}

// ═══ 🃏 KOLEKCJA KART — codzienna paczka, kolekcja według drużyn, prezenty, ranking ═══
const _TIER_COL = { limited: '#f5c518', galaxy: '#a855f7', diamond: '#38bdf8', gold: '#f5c518', silver: '#cbd5e1', bronze: '#d08b4f' };
const _TIER_LBL = { limited: ['🌟 Limitowana', '🌟 Limited'], galaxy: ['🌌 Galaktyka', '🌌 Galaxy'], diamond: ['💎 Diament', '💎 Diamond'], gold: ['🥇 Złoto', '🥇 Gold'], silver: ['🥈 Srebro', '🥈 Silver'], bronze: ['🥉 Brąz', '🥉 Bronze'] };
let _cards = null;
function renderCardsView(){return __lz(8,'renderCardsView',this,arguments)}
async function _dailyRefresh() {
  if(!discordUser?.session) { window._cardsCanOpen = false; return; }
  try { await karnetLoad(); } catch(e) {}
  try { await streakLoad(); } catch(e) {}
  try { const r = await _api('/cards/me', 'GET', null, { session: true }); window._cardsCanOpen = !!(r.ok && r.canOpen); } catch(e) {}
  try { updateMyPanelBadge(); if(document.getElementById('view-mypanel')?.classList.contains('active')) renderMyPanelView(); } catch(e) {}
}
function _teamEventsToast(){return __lz(8,'_teamEventsToast',this,arguments)}
function cardsOpen(){return __lz(8,'cardsOpen',this,arguments)}
let _rcy = null; function cardsRecycle(){return __lz(8,'cardsRecycle',this,arguments)}
function _rcyStep(){return __lz(8,'_rcyStep',this,arguments)}
function _rcyDraw(){return __lz(8,'_rcyDraw',this,arguments)}
function _rcyGo(){return __lz(8,'_rcyGo',this,arguments)}
function cardsGift(){return __lz(8,'cardsGift',this,arguments)}

// ═══ 🔗 LINK DO EVENTU (#event/<id>) ═══
function eventLink(id) { return location.origin + '/event/' + encodeURIComponent(id); }
async function copyEventLink(id) {
  const url = eventLink(id);
  try { await navigator.clipboard.writeText(url); showToast(_g('🔗 Skopiowano link do draftu — wklej go na Discordzie', '🔗 Draft link copied — paste it on Discord'), 'success'); } catch(e) { prompt(_g('Skopiuj link:', 'Copy the link:'), url); }
}
function openSuggest(){return __lz(8,'openSuggest',this,arguments)}
function suggestSend(){return __lz(8,'suggestSend',this,arguments)}
function openSuggestions(){return __lz(8,'openSuggestions',this,arguments)}

// ⏳ odliczanie do północy (czas polski) — nowa zagadka 2Kordle i nowa paczka kart
function _msToWarsawMidnight() {
  const now = new Date(), pl = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
  const mid = new Date(pl); mid.setHours(24, 0, 0, 0); return mid - pl;
}
function _cdText() { const ms = _msToWarsawMidnight(), h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4);
  return currentLang === 'en' ? (h ? `${h} h ${m} min` : `${m} min`) : (h ? `${h} godz. ${m} min` : `${m} min`); }
function _cdHtml(pl, en) { return `<span class="cd-midnight" data-pl="${pl}" data-en="${en}">${currentLang === 'en' ? en : pl} <b>${_cdText()}</b></span>`; }
setInterval(() => { document.querySelectorAll('.cd-midnight').forEach(el => { const b = el.querySelector('b'); if(b) b.textContent = _cdText(); });
  if(_msToWarsawMidnight() < 61000) setTimeout(() => { try { if(document.getElementById('view-kordle')?.classList.contains('active')) renderKordle(); if(document.getElementById('view-cards')?.classList.contains('active')) renderCardsView(); _dailyRefresh?.(); } catch(e) {} }, 62000); }, 30000);

// ═══ 🎟️ KARNET TYGODNIA ═══
let _karnet = null;
async function karnetLoad() { if(!discordUser?.session) return null; const r = await _api('/karnet', 'GET', null, { session: true }); _karnet = r.ok && Array.isArray(r.quests) ? r : null; return _karnet; }
function _karnetClaimable(k) { k = k || _karnet; return !!k && Array.isArray(k.quests) && (k.quests.some(q => q.done && !q.off && !q.claimed) || (k.all && !k.allClaimed)); }
function karnetHtml(k) {
  if(!k || !Array.isArray(k.quests)) return '';
  const en = currentLang === 'en', ends = new Date(k.ends + 'T23:59:00').toLocaleDateString(en ? 'en-GB' : 'pl-PL', { weekday: 'long' });
  const GO = { terminarz: "showView('schedule')", '2kordle': "showView('kordle')", kolekcja: "showView('cards')", dashboard: "showView('dashboard')", fantasy: "showView('fantasy')" };
  return `<div data-notr class="card" style="padding:.75rem .9rem;margin-bottom:1rem;border:1px solid var(--accent)">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:.5rem;flex-wrap:wrap"><b style="font-family:'Barlow Condensed',sans-serif;font-size:1.15rem;letter-spacing:1px">🎟️ ${en ? 'WEEKLY PASS' : 'KARNET TYGODNIA'}</b><span style="font-size:.72rem;color:var(--muted)">${en ? 'ends' : 'koniec'}: ${ends} · ${en ? 'new tasks every Monday' : 'nowe zadania co poniedziałek'}</span></div>
    ${k.quests.filter(q => !q.off).map(q => { const pct = Math.min(100, Math.round(q.have / q.need * 100));
      return `<div style="display:grid;grid-template-columns:1fr auto;gap:.5rem;align-items:center;padding:.4rem 0;border-bottom:1px dashed rgba(127,127,127,.2)">
        <div><div style="font-size:.84rem;cursor:pointer" onclick="${GO[q.go] || ''}">${q.icon} ${en ? q.en : q.pl} <span style="color:var(--muted);font-size:.74rem">${Math.min(q.have, q.need)}/${q.need}</span></div>
          <div style="height:6px;border-radius:3px;background:var(--surface2);margin-top:.25rem;overflow:hidden"><div style="height:100%;width:${pct}%;background:${q.done ? 'var(--win)' : 'var(--accent)'}"></div></div></div>
        ${q.claimed ? `<span style="font-size:.74rem;color:var(--win)">✅ +${q.xp} XP</span>` : q.done ? `<button class="btn btn-primary" style="font-size:.7rem;padding:.2rem .55rem" onclick="karnetClaim('${q.id}')">${en ? 'Claim' : 'Odbierz'} +${q.xp} XP</button>` : `<span style="font-size:.72rem;color:var(--muted)">+${q.xp} XP</span>`}</div>`; }).join('')}
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-top:.55rem;flex-wrap:wrap">
      <span style="font-size:.8rem">🏆 ${en ? 'All tasks done' : 'Wszystkie zadania'}: <b>+${k.bonus.xp} XP</b> ${en ? 'and' : 'i'} <b>🎁 ${en ? 'an extra card pack' : 'dodatkowa paczka kart'}</b></span>
      ${k.allClaimed ? `<span style="font-size:.76rem;color:var(--win)">✅ ${en ? 'Claimed' : 'Odebrane'}</span>` : `<button class="btn ${k.all ? 'btn-primary' : 'btn-ghost'}" style="font-size:.72rem" ${k.all ? '' : 'disabled'} onclick="karnetClaim('all')">🎁 ${en ? 'Claim reward' : 'Odbierz nagrodę'}</button>`}</div>
    <div style="font-size:.66rem;color:var(--muted);margin-top:.35rem">${en ? 'XP counts in the Fan league.' : 'XP liczą się w Lidze kibiców.'}</div></div>`;
}
function karnetClaim(){return __lz(8,'karnetClaim',this,arguments)}
function karnetMount(){return __lz(8,'karnetMount',this,arguments)}

// ═══ 🌟 KARTY LIMITOWANE (kolekcja + admin) ═══
// 🌟 karta limitowana: zwykła karta gracza w złotej ramce z banerem okazji (ten sam wygląd co u bota)
// 🌟 KARTA LIMITOWANA — motywy (złoty, Halloween, Święta, Ogień) z dekoracjami zależnymi od wariantu; wspólny kod strony i bota
const _LIM_THEMES = {
  gold: { stops: ['#fff3b0', '#f5c518', '#a87a08', '#f5c518', '#fff0a0'], banner: '#120d02', text: '#ffd84d', tint: null, deco: [] },
  halloween: { stops: ['#ffb347', '#ff7a00', '#5b1a8a', '#ff7a00', '#ffb347'], banner: '#14060f', text: '#ff9a2e', tint: ['rgba(255,122,0,.18)', 'rgba(91,26,138,.28)'], deco: [['🎃', '🦇', '🕸️'], ['👻', '🦇', '🍬'], ['🕷️', '🕸️', '🎃'], ['🦇', '🌕', '👻'], ['🍬', '🎃', '🕷️']] },
  xmas: { stops: ['#e8fff1', '#16a34a', '#b91c1c', '#16a34a', '#fef2f2'], banner: '#0b1a10', text: '#fca5a5', tint: ['rgba(22,163,74,.16)', 'rgba(185,28,28,.2)'], deco: [['🎄', '❄️', '🎁'], ['⭐', '❄️', '🎅'], ['🎁', '🔔', '❄️'], ['❄️', '⛄', '🎄']] },
  fire: { stops: ['#fff1a8', '#f97316', '#b91c1c', '#f97316', '#fde68a'], banner: '#170603', text: '#fdba74', tint: ['rgba(249,115,22,.16)', 'rgba(185,28,28,.22)'], deco: [['🔥', '🔥', '💥'], ['🔥', '⚡', '🔥']] },
  record: { stops: ['#fff8d0', '#f5c518', '#5c4300', '#f5c518', '#fff3b0'], banner: '#0a0800', text: '#ffd84d', tint: ['rgba(0,0,0,.04)', 'rgba(70,50,0,.10)'], deco: [] }
};
function _limHalloween(){return __lz(8,'_limHalloween',this,arguments)}
function _limRecord(){return __lz(8,'_limRecord',this,arguments)}
function _limPaint(){return __lz(8,'_limPaint',this,arguments)}
function _limPersonaPaint(){return __lz(8,'_limPersonaPaint',this,arguments)}
function _pcLimitedImage(){return __lz(8,'_pcLimitedImage',this,arguments)}
function openLimitedCard(){return __lz(8,'openLimitedCard',this,arguments)}
if(EU_MODE) document.addEventListener('DOMContentLoaded', () => { document.body.classList.add('eu'); document.title = 'EU Chemik League — NBA 2K Pro-Am'; });
// zabezpieczenie: układ Dashboardu, menu i bloki EU także wtedy, gdy liga jest pusta albo dane dodatkowe się nie wczytały
window.addEventListener('load', () => [1500, 4000].forEach(t => setTimeout(() => { try { _moveJoinSection(); _dashLayout(); renderSideNav(); renderEuBillboard(); if(EU_MODE) renderEuDash(); else renderDashNews(); } catch(e) { console.warn('layout fallback', e); } }, t)));
// ✨ HOLO — karta przechyla się za kursorem / telefonem, po powierzchni przesuwa się tęczowy połysk (jak karty holo w FIFA)
function _holoHtml(src, alt, power) {
  return `<div class="holo" data-p="${power}" style="--mx:50%;--my:50%;--rx:0deg;--ry:0deg;--o:0"><div class="holo-in"><img src="${src}" alt="${_h(alt || '')}"><div class="holo-shine"></div><div class="holo-glare"></div></div></div>`;
}
function _holoBind(){return __lz(8,'_holoBind',this,arguments)}

// ═══ 🃏 WYBÓR KART (wspólne okno: wyzwania, Moja piątka, gablota) ═══
// 🃏 MINI-KARTA — wspólny wygląd kart w wyborze talii i w Korcie (avatar z Discorda, logo drużyny, ocena, poziom)
const _MC_BG = { galaxy: ['#2e1065', '#0e7490'], diamond: ['#0c4a6e', '#1e293b'], gold: ['#422006', '#1f1405'], silver: ['#334155', '#111827'], bronze: ['#3b2412', '#140b05'], limited: ['#3d2c00', '#120d02'] };
function _mcAvatar(){return __lz(8,'_mcAvatar',this,arguments)}
function _miniCard(){return __lz(8,'_miniCard',this,arguments)}

function openCardPicker(){return __lz(8,'openCardPicker',this,arguments)}
const TIER_ORDER = { bronze: 0, silver: 1, gold: 2, diamond: 3, galaxy: 4, limited: 5 };

// ═══ 🧩 WYZWANIA ═══
// ⚒️ / 🎯 stałe wymiany duplikatów
let _cr = null;
const _poolBy = () => { const m = {}; (_cards?.pool || []).forEach(p => m[p.k] = p); return m; };
const _PICK_COST = { bronze: 12, silver: 15, gold: 20, diamond: 25, galaxy: 30 }, _TIER_ICO = { bronze: '🟤', silver: '⚪', gold: '🟡', diamond: '💠', galaxy: '🌌' };
function craftOpen(){return __lz(8,'craftOpen',this,arguments)}
function _crTarget(){return __lz(8,'_crTarget',this,arguments)}
function _crStep(){return __lz(8,'_crStep',this,arguments)}
function _crDraw(){return __lz(8,'_crDraw',this,arguments)}
function _crGo(){return __lz(8,'_crGo',this,arguments)}

function challengesHtml(){return __lz(8,'challengesHtml',this,arguments)}

function challengePick(){return __lz(8,'challengePick',this,arguments)}

// ═══ 🏀 MOJA PIĄTKA ═══
let _ut = null;
function utHtml(){return __lz(8,'utHtml',this,arguments)}
function utPick(){return __lz(8,'utPick',this,arguments)}

function showcasePick(){return __lz(8,'showcasePick',this,arguments)}
function showcaseRender(){return __lz(8,'showcaseRender',this,arguments)}

function _limTile(){return __lz(8,'_limTile',this,arguments)}
function _setRewardToast(){return __lz(8,'_setRewardToast',this,arguments)}
function limitedSetsHtml(){return __lz(8,'limitedSetsHtml',this,arguments)}

// 🔁 WYMIANY KART: sekcja w kolekcji, „kto ma tę kartę?”, kreator propozycji
let _trd = null;
function tradesSectionHtml(){return __lz(8,'tradesSectionHtml',this,arguments)}
function _tradeAfter(){return __lz(8,'_tradeAfter',this,arguments)}
function tradeRespond(){return __lz(8,'tradeRespond',this,arguments)}
function tradeCancel(){return __lz(8,'tradeCancel',this,arguments)}
function openCardHolders(){return __lz(8,'openCardHolders',this,arguments)}
function openTradeComposer(){return __lz(8,'openTradeComposer',this,arguments)}
function _trdLoad(){return __lz(8,'_trdLoad',this,arguments)}
function _trdPick(){return __lz(8,'_trdPick',this,arguments)}
function _trdDraw(){return __lz(8,'_trdDraw',this,arguments)}
function _lastCopyOk(){return __lz(8,'_lastCopyOk',this,arguments)}
function tradeSend(){return __lz(8,'tradeSend',this,arguments)}

function limitedSectionHtml(){return __lz(8,'limitedSectionHtml',this,arguments)}
// 🌟 KREATOR KART LIMITOWANYCH (admin): rodzaj, motyw, osoba spoza ligi, podgląd, data końca, szansa; okazje (np. Halloween z cegieł tygodnia)
const _LIM_KINDS = [['special', '✨ Specjalna'], ['event', '🎉 Okazja'], ['mvp', '⭐ MVP'], ['record', '🏆 Rekord']];
const _LIM_THEME_LBL = [['gold', '🌟 Złoty'], ['record', '🏛 Rekord'], ['halloween', '🎃 Halloween'], ['xmas', '🎄 Święta'], ['fire', '🔥 Ogień']];
// zakres statystyk karty limitowanej: zapisana kolejka, a dla starszych kart — numer tygodnia z napisu („… WEEK 2”)
function _limScope(c) {
  if(c?.matchId) return 'match:' + c.matchId; // karta z rekordowego meczu
  const w = c?.week || +(String(c?.label || '').match(/WEEK\s*(\d+)/i) || [])[1] || null;
  return w && c?.kind !== 'special' ? 'week:' + (c.seasonId || currentSeasonId || '') + ':' + w : null;
}
function _rookieCardImage(){return __lz(8,'_rookieCardImage',this,arguments)}
function _limRender(){return __lz(8,'_limRender',this,arguments)}
let _limDraft = null;
function openLimitedAdmin(){return __lz(8,'openLimitedAdmin',this,arguments)}
function _limForm(){return __lz(8,'_limForm',this,arguments)}
function limPreview(){return __lz(8,'limPreview',this,arguments)}
function limitedCreate(){return __lz(8,'limitedCreate',this,arguments)}
function _weekBrickRank(){return __lz(8,'_weekBrickRank',this,arguments)}
// 🏛 rekordy indywidualne (najlepszy pojedynczy mecz): cała historia albo bieżący sezon
const _REC_CATS = [['pts', 'PTS', 'punktów'], ['reb', 'REB', 'zbiórek'], ['ast', 'AST', 'asyst'], ['stl', 'STL', 'przechwytów'], ['blk', 'BLK', 'bloków'], ['tpm', '3PM', 'trójek']];
function _leagueRecordList(){return __lz(8,'_leagueRecordList',this,arguments)}
function _recForm(){return __lz(8,'_recForm',this,arguments)}
function recList(){return __lz(8,'recList',this,arguments)}
function recPreview(){return __lz(8,'recPreview',this,arguments)}
function recCreate(){return __lz(8,'recCreate',this,arguments)}
function _eventWeeks(){return __lz(8,'_eventWeeks',this,arguments)}
function _eventBricks(){return __lz(8,'_eventBricks',this,arguments)}
function _eventForm(){return __lz(8,'_eventForm',this,arguments)}
function eventPreview(){return __lz(8,'eventPreview',this,arguments)}
function eventCreate(){return __lz(8,'eventCreate',this,arguments)}
function openChallengeLog(){return __lz(8,'openChallengeLog',this,arguments)}
// 📦 HISTORIA PACZEK — otrzymane (skąd) i otwarte (co wypadło); gracz widzi swoją, admin szuka po osobie
const _PK = { daily: ['📅', 'dzienna', 'daily'], bonus: ['🎁', 'dodatkowa', 'extra'], premium: ['💎', 'premium', 'premium'] };
function _packHistHtml(){return __lz(8,'_packHistHtml',this,arguments)}
function openMyPackHistory(){return __lz(8,'openMyPackHistory',this,arguments)}
function openPackAdmin(){return __lz(8,'openPackAdmin',this,arguments)}
function packAdminSearch(){return __lz(8,'packAdminSearch',this,arguments)}

function openGrantPacks(){return __lz(8,'openGrantPacks',this,arguments)}
function grantPacks(){return __lz(8,'grantPacks',this,arguments)}

// ═══ 🔥 SERIA DNI ═══
let _streak = null;
async function streakLoad() {
  if(!discordUser?.session) return null;
  const r = await _api('/streak', 'GET', null, { session: true }); if(!r.ok) return null; _streak = r;
  (r.granted || []).forEach(g => showToast(g.kind === 'pack' ? _g(`🔥 Seria ${g.th} dni! Dostajesz ${g.val > 1 ? g.val + ' dodatkowe paczki' : 'dodatkową paczkę'} kart 🎁`, `🔥 ${g.th}-day streak! You get ${g.val > 1 ? g.val + ' extra packs' : 'an extra card pack'} 🎁`) : _g(`🔥 Seria ${g.th} dni! +${g.val} XP`, `🔥 ${g.th}-day streak! +${g.val} XP`), 'success'));
  if((r.granted || []).some(g => g.kind === 'pack')) window._cardsCanOpen = true;
  document.querySelectorAll('.streak-slot').forEach(el => el.innerHTML = streakChip());
  try { updateMyPanelBadge(); } catch(e) {}
  return r;
}
function streakChip() {
  const s = _streak; if(!s) return '';
  const nx = s.next ? (s.next[1] === 'pack' ? _g(`${s.next[0]} dni → 🎁 paczka`, `${s.next[0]} days → 🎁 pack`) : _g(`${s.next[0]} dni → +${s.next[2]} XP`, `${s.next[0]} days → +${s.next[2]} XP`)) : '';
  return `<div data-notr style="display:inline-flex;align-items:center;gap:.5rem;background:var(--surface2);border:1px solid ${s.todayDone ? 'var(--accent)' : '#f97316'};border-radius:999px;padding:.3rem .8rem;font-size:.82rem">
    <b style="font-size:1.05rem">🔥 ${s.streak}</b><span>${_g(_plPL(s.streak, 'dzień', 'dni', 'dni') + ' z rzędu', (s.streak === 1 ? 'day' : 'days') + ' in a row')}</span>
    <span style="color:var(--muted);font-size:.72rem">${s.todayDone ? '✅ ' + _g('dziś zaliczone', 'done today') : '⚠️ ' + _g('zrób dziś cokolwiek, żeby jej nie stracić', 'do anything today to keep it')}${nx ? ' · ' + _g('następna nagroda', 'next reward') + ': ' + nx : ''} · ${_g('rekord', 'best')} ${s.best}</span></div>`;
}

function openFanProfile(){return __lz(8,'openFanProfile',this,arguments)}
function closeFanSeason(){return __lz(8,'closeFanSeason',this,arguments)}

// ═══ ⚔️ RYWALIZACJE: link, następny mecz, rekord, nazwa, Klasyki na Dashboardzie ═══
const _rivKey = (a, b) => [a, b].map(x => String(x).toLowerCase()).sort().join('~');
function _rivName(a, b) { return (window._rivalryNames || {})[_rivKey(a, b)] || null; }
function _rivalryExtras(a, b) {
  const games = _h2hGames(a, b); let best = null;
  games.forEach(m => [m.team1, m.team2].forEach(t => (t.players || []).forEach(p => { if(!best || (+p.pts || 0) > best.pts) best = { name: p.name, team: t.name, pts: +p.pts || 0, reb: +p.reb || 0, ast: +p.ast || 0, date: m.date }; })));
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' }), kA = String(a).toLowerCase(), kB = String(b).toLowerCase();
  const next = schedule.filter(s => !s.played && s.date && s.date >= today && !_ssResult({ demo: false }, s)?.done && [s.team1, s.team2].map(x => String(x).toLowerCase()).sort().join('~') === [kA, kB].sort().join('~')).sort((x, y) => String(x.date + (x.time || '')).localeCompare(String(y.date + (y.time || ''))))[0];
  return `<div data-notr style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.5rem;margin:.6rem 0;font-size:.78rem">
    ${next ? `<div style="background:var(--surface2);border-radius:8px;padding:.5rem .65rem;border:1px solid var(--accent)">📅 <b>${_g('Następny mecz', 'Next game')}:</b><br>${_ssFmt(next.date)}${next.time ? ' · ' + next.time : ''} (Week ${next.week})</div>` : ''}
    ${best ? `<div style="background:var(--surface2);border-radius:8px;padding:.5rem .65rem">🏀 <b>${_g('Rekord występu', 'Best performance')}:</b><br>${_h(best.name)} (${_h(best.team)}) — ${best.pts} PTS · ${best.reb} REB · ${best.ast} AST, ${_ssFmt(best.date)}</div>` : ''}
    <div style="background:var(--surface2);border-radius:8px;padding:.5rem .65rem;display:flex;gap:.4rem;align-items:center;flex-wrap:wrap">
      <button class="btn btn-ghost" style="font-size:.7rem" onclick="navigator.clipboard?.writeText(location.origin+location.pathname+'#rywalizacja/'+encodeURIComponent(this.dataset.k)).then(()=>showToast('🔗 ${_g('Skopiowano link do rywalizacji', 'Rivalry link copied')}','success'))" data-k="${_h(_rivKey(a, b))}">🔗 ${_g('Link do rywalizacji', 'Rivalry link')}</button>
      ${_isLoggedInSync() ? `<button class="btn btn-ghost" style="font-size:.7rem" onclick="rivalryRename(this.dataset.a, this.dataset.b)" data-a="${_h(a)}" data-b="${_h(b)}">✏️ ${_g('Nazwa', 'Name')}</button>` : ''}</div>
  </div>`;
}
function rivalryRename(){return __lz(8,'rivalryRename',this,arguments)}
function renderClassics() {
  const el = document.getElementById('classics-wrap'); if(!el) return;
  const all = _withAllMatches(() => matches.filter(m => !m.walkover)), pairs = {};
  all.forEach(m => { const k = _rivKey(m.team1.name, m.team2.name), o = pairs[k] = pairs[k] || { a: [m.team1.name, m.team2.name].sort((x, y) => x.toLowerCase().localeCompare(y.toLowerCase()))[0], b: null, n: 0, wa: 0, close: 0, last: '' };
    o.b = o.a === m.team1.name ? m.team2.name : m.team1.name; o.n++; const aWon = (m.team1.name === o.a ? +m.team1.score > +m.team2.score : +m.team2.score > +m.team1.score); if(aWon) o.wa++;
    if(Math.abs((+m.team1.score || 0) - (+m.team2.score || 0)) <= 5) o.close++; if(String(m.date) > o.last) o.last = String(m.date); });
  const list = Object.values(pairs).filter(p => p.n >= 4).map(p => ({ ...p, score: p.n * (1 - Math.abs(p.wa - (p.n - p.wa)) / p.n) + p.close * 1.5 })).filter(p => p.score >= 2.5).sort((x, y) => y.score - x.score).slice(0, 4);
  if(!list.length) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="section-title" style="font-size:1.3rem">⚔️ ${_g('Klasyki ligi', 'League classics')}</div>
    <div data-notr style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.6rem;margin-bottom:1.5rem">${list.map(p => `<div class="card" onclick="openRivalry(this.dataset.a, this.dataset.b)" data-a="${_h(p.a)}" data-b="${_h(p.b)}" style="padding:.65rem .8rem;cursor:pointer">
      ${_rivName(p.a, p.b) ? `<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:#f97316;margin-bottom:.25rem">🔥 ${_h(_rivName(p.a, p.b)).toUpperCase()}</div>` : ''}
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:.4rem;align-items:center;text-align:center">
        <div>${teamLogo(p.a, 34, '.7rem')}<div style="font-size:.74rem;font-weight:800;margin-top:.15rem">${_h(p.a)}</div></div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem">${p.wa}:${p.n - p.wa}</div>
        <div>${teamLogo(p.b, 34, '.7rem')}<div style="font-size:.74rem;font-weight:800;margin-top:.15rem">${_h(p.b)}</div></div></div>
      <div style="font-size:.68rem;color:var(--muted);text-align:center;margin-top:.3rem">${p.n} ${_g(_plPL(p.n, 'mecz', 'mecze', 'meczów'), 'games')} · ${p.close} ${_g(_plPL(p.close, 'zacięty', 'zacięte', 'zaciętych') + ' (≤5 pkt)', 'close (≤5 pts)')}</div></div>`).join('')}</div>`;
}

// ═══ 🧭 BOCZNE MENU (komputer ≥1024 px) + 🛠 PANEL ADMINA (narzędzia w grupach) ═══
function _discordInvite() { return window._discordInviteUrl || 'https://discord.gg/EQ87cFkuW'; }
function openDiscordInvite(){return __lz(8,'openDiscordInvite',this,arguments)}
function dinvSave(){return __lz(8,'dinvSave',this,arguments)}
function _adminGroups() {
  const pend = (pendingResults || []).length; let q = 0; try { q = _qualityList().length; } catch(e) {}
  const gm = typeof _gmVisible === 'function' && _gmVisible();
  return [
    { id: 'mecze', icon: '🏀', title: _g('Mecze i wyniki', 'Games & results'), items: [
      ['➕', _g('Dodaj mecz', 'Add game'), "showView('add-match')"], ['📸', _g('Czekające wyniki', 'Pending results'), 'openPendingResults()', pend], ['🛡', _g('Do sprawdzenia', 'To review'), 'openQualityReview()', q],
      ['📜', _g('Regulamin terminów', 'Deadline rules'), 'openRules()'], ['⚖️', _g('Kary', 'Penalties'), 'openPenalties()'], ['⏰', _g('Przypomnienia', 'Reminders'), 'openRemindersStatus()'], ['⚙', _g('Aliasy nicków', 'Nickname aliases'), "showView('aliases')"]] },
    { id: 'sezon', icon: '📅', title: _g('Sezon i terminarz', 'Season & schedule'), items: [
      ['⚙', _g('Generuj terminarz', 'Generate schedule'), 'openFixtureGenerator()'], ['🗂', _g('Sezony', 'Seasons'), 'openSeasonModal()'], ['➕', _g('Dopisz drużynę do terminarza', 'Add a team to the schedule'), 'openAddTeamToSchedule()'], ['💶', 'Zapisy: wpisowe i regulamin', 'openSignupSettings()'], ['💳', 'Płatności drużyn', 'openPayments()'], ['🏆', 'Playoff', 'openPlayoffModal()'], ['🔄', _g('Nazwy drużyn', 'Team names'), 'openTeamNameFixer()'],
      ['🧪', _g('Demo terminarza', 'Schedule demo'), 'startDemo()'], ...(gm ? [['🏆', 'Liga GM', "showView('gm')"]] : [])] },
    { id: 'druzyny', icon: '👥', title: _g('Drużyny i gracze', 'Teams & players'), items: [
      ['👥', _g('Użytkownicy i składy', 'Users & rosters'), "_uo.users=null;openUsersOverview('teams')"], ['🧢', _g('Zgłoszenia drużyn', 'Team registrations'), "goToTeamRegistrations();setRegTab('teams')"],
      ['🔁', _g('Okno transferowe', 'Transfer window'), 'openTrades()'], ['🔗', _g('Powiązania PSN', 'PSN links'), 'openPsnMapModal()']] },
    { id: 'tresci', icon: '🎙', title: _g('Treści i media', 'Content & media'), items: [
      ['🎙', _g('Studio podcastu', 'Podcast studio'), 'openPodcastStudio()'], ['🖼', _g('Podsumowanie kolejki', 'Round summary'), 'openWeekGraphics()'], ['🎬', 'Short', 'openShortMaker()'],
      ['🐦', _g('Kolejka X', 'X queue'), 'openXQueue()'], ['🌟', _g('Karty limitowane', 'Limited cards'), 'openLimitedAdmin()'], ['🎁', _g('Daj paczki', 'Give packs'), 'openGrantPacks()'], ['🧩', _g('Wyzwania — historia', 'Challenges — history'), 'openChallengeLog()'], ['📦', _g('Historia paczek', 'Pack history'), 'openPackAdmin()'], ['🃏', _g('Kort — balans', 'Kort — balance'), 'openKortBalance()'], ['🔁', _g('Kort — przelicz ELO', 'Kort — recalc ELO'), 'openEloRecalc()'], ['🎁', _g('Ogłoś Wrapped', 'Announce Wrapped'), 'announceWrapped()'], ['🎬', _g('Top akcje tygodnia', 'Top plays of the week'), 'openTopClipsMaker()'], ['🎟️', _g('Przepustka sezonowa: włącz / wyłącz', 'Season pass: on / off'), 'passAdminToggle()'], ['⚡', _g('Do zrobienia (szybki panel)', 'To do (quick panel)'), 'openAdminQuick()'], ['📣', _g('Przypomnienie o wpisowym', 'Entry fee reminder'), 'openPayRemind()'], ['🚀', _g('Start ligi: odliczanie, typy, ranking', 'League launch: countdown, picks, ranking'), 'openLaunch()'], ['🧩', _g('Podział na dywizje', 'Divisions'), 'openDivisions()'], ['🔗', _g('Połączone konta (PL i EU)', 'Linked accounts (PL & EU)'), 'openLinkedAccounts()'], ['📊', _g('Ekonomia paczek', 'Pack economy'), 'openPackEconomy()'], ['🎧', 'DJ', 'openDjSettings()']] },
    { id: 'discord', icon: '🤖', title: 'Discord', items: [
      ['📣', _g('Kanały powiadomień', 'Notification channels'), 'openRoutesModal()'], ['🎭', _g('Role Discord', 'Discord roles'), 'openRolesSettings()'], ['🤖', _g('Komendy bota', 'Bot commands'), 'openBotCommands()'],
      ['🎖', _g('Kanał osiągnięć', 'Achievements channel'), "openWebhookModal('achievements')"], ['🔗', _g('Zaproszenie na Discord', 'Discord invite'), 'openDiscordInvite()', window._discordInviteUrl ? 0 : 1]] },
    { id: 'system', icon: '🛡', title: _g('System', 'System'), items: [
      ['🩺', _g('Stan systemu', 'System health'), 'openHealth()'], ['📝', _g('Dziennik zmian', 'Change log'), 'openAudit()'], ['💾', _g('Kopie', 'Backups'), 'openBackups()'], ['⚙', _g('Baza danych', 'Database'), 'openSetupModal()'], ['💡', _g('Sugestie', 'Suggestions'), 'openSuggestions()'], ['🔓', _g('Wyloguj admina', 'Admin log out'), 'logout()']] }
  ].map(g => ({ ...g, badge: g.items.reduce((n, it) => n + (+it[3] || 0), 0) }));
}
function openAdminHub(){return __lz(8,'openAdminHub',this,arguments)}
function renderSideNav() {
  let el = document.getElementById('side-nav');
  if(!el) { el = document.createElement('aside'); el.id = 'side-nav'; el.setAttribute('aria-label', 'Menu'); document.body.prepend(el); }
  document.body.classList.add('side-on');
  document.body.classList.toggle('side-col', localStorage.getItem('nba2k_side_col') === '1');
  let cur = (document.querySelector('.view.active')?.id || 'view-dashboard').replace(/^view-/, ''); if(cur === 'join') cur = 'join:' + (typeof _regTab !== 'undefined' ? _regTab : 'teams');
  const faN = (freeAgents || []).filter(f => f.status === 'active').length;
  const lw = document.getElementById('live-wrap')?.innerText || '', live = /NA ŻYWO|LIVE/i.test(lw);
  const myN = parseInt(document.getElementById('mypanel-badge')?.textContent || '0', 10) || 0;
  const logo = document.querySelector('header .logo img')?.src || '';
  const it = (view, ic, label, act, badge, kind) => `<button class="sn-item${view && view === cur ? ' on' : ''}" ${view ? `data-v="${view}"` : ''} onclick="${act || `showView('${view.split(':')[0]}')`}" title="${_h(label)}"><span class="sn-ico">${ic}</span><span class="sn-lbl">${_h(label)}</span>${badge ? `<span class="sn-b ${kind || ''}">${badge}</span>` : ''}</button>`;
  const sec = t => `<div class="sn-sec"><span>${t}</span></div>`;
  const admin = _isLoggedInSync();
  el.innerHTML = `<div class="sn-brand">${logo ? `<img src="${logo}" alt="">` : ''}<div class="sn-name">${EU_MODE ? '<b style="color:#ffcc00">🇪🇺 EU CHEMIK</b><b>LEAGUE</b>' : '<b>2K PRO-AM</b><b style="color:var(--accent)">EKSTRAKLASA</b>'}</div></div>
    <div class="sn-lbl-wrap">${_leagueSwitchHtml()}</div>
    ${EU_MODE ? '' : `<button class="sn-item sn-eu" onclick="location.href='${_h(_signup().euUrl || EU_SITE)}'" title="EU Chemik League"><span class="sn-ico">🇪🇺</span><span class="sn-lbl">EU LEAGUE <small>SIGN UPS OPEN</small></span></button>`}
    ${it('dashboard', '🏠', 'Dashboard')}
    ${sec(_g('Liga', 'League'))}
    ${EU_MODE || _rulesExist() ? it('rules', '📜', _g('Regulamin', 'Rules')) : ''}${it('teams', '👥', _g('Drużyny', 'Teams'))}${it('schedule', '📅', _g('Terminarz', 'Schedule'))}${it('matches', '🏀', _g('Mecze', 'Games'))}${it('standings', '📋', _g('Tabela', 'Standings'))}${it('stats', '📊', _g('Statystyki', 'Statistics'))}
    ${sec(_g('Dołącz', 'Join us'))}
    ${it('join:teams', '🧢', _g('Zapisy do ligi', 'League sign-ups'), "goJoin('teams')")}${it('join:fa', '🆓', _g('Wolni agenci', 'Free agents'), "goJoin('fa')", faN || '')}${it('join:tr', '🔁', _g('Transfery', 'Transfers'), "goJoin('tr')")}
    ${sec(_g('Minigry', 'Minigames'))}
    ${it('fans', '🏅', _g('Liga kibiców', 'Fan league'))}${it('fantasy', '🏀', 'Fantasy')}${it('fplus', '⭐', 'Fantasy+', null, 'NEW', 'new')}${it('kordle', '🧩', '2Kordle')}${it('kort', '🃏', _g('Kort — gra karciana', 'Kort — card game'), '', 'NEW', 'live')}
    ${sec(_g('Nagrody', 'Awards'))}
    ${it('cards', '🃏', _g('Kolekcja kart', 'Card collection'))}${it('totw', '🏆', _g('Piątka tygodnia', 'Team of the Week'))}${it('awards', '🗳️', _g('Głosowanie tygodnia', 'Weekly vote'), '', (awardsList || []).some(a => a.status === 'open') ? '●' : '', 'red')}
    ${sec(_g('Drafty', 'Drafts'))}
    ${it('events', '📝', _g('Zapisy', 'Sign-ups'))}${it('', '🗂️', _g('Drabinka', 'Bracket'), "openCurrentDraft('bracket')")}${it('', '📈', _g('Wyniki', 'Scores'), "openCurrentDraft('matches')")}
    ${sec('Media')}
    ${it('multistream', '📺', 'Multistream', 'openMultistream()', live ? 'LIVE' : '', 'live')}${it('podcast', '🎙', 'Podcast')}${it('', '📜', _g('Kronika ligi', 'League chronicle'), 'openChronicle()')}${it('', '🏛', _g('Rekordy', 'Records'), '_recordsEdition=undefined;openLeagueRecordsModal()')}${discordUser ? it('', '🎁', _g('Mój Wrapped', 'My Wrapped'), '_wr.tab=null;openWrapped()') : ''}
    ${admin ? sec('Admin') + _adminGroups().map(g => it('', g.icon, g.title, `openAdminHub('${g.id}')`, g.badge || '', 'warn')).join('') : ''}
    <div style="flex:1;min-height:14px"></div>
    ${sec(_g('Ty', 'You'))}
    ${it('mypanel', '👤', _g('Mój panel', 'My panel'), '', myN || '', 'red')}
    ${discordUser ? it('', '💡', _g('Zgłoś sugestię', 'Send a suggestion'), 'openSuggest()') : ''}
    <button class="sn-item sn-toggle" onclick="localStorage.setItem('nba2k_side_col', document.body.classList.contains('side-col') ? '0' : '1'); renderSideNav()" title="${_g('Zwiń / rozwiń menu', 'Collapse / expand menu')}"><span class="sn-ico">${document.body.classList.contains('side-col') ? '»' : '«'}</span><span class="sn-lbl">${_g('Zwiń menu', 'Collapse menu')}</span></button>`;
}
function _sideSync(){return __lz(8,'_sideSync',this,arguments)}

// ═══ 🏀 PIĄTKA TYGODNIA — 5 najlepszych występów kolejki (średnia ocena występu na mecz; ta sama miara co grafiki i MVP) ═══
let _totwWeek = null;
function _totwWeeks() { // tylko zakończone kolejki: każde spotkanie rozegrane albo walkower
  const sid = currentSeasonId || null, by = {};
  (schedule || []).filter(x => x.generated && !x.makeup && (x.seasonId || null) === sid && x.week).forEach(x => (by[+x.week] = by[+x.week] || []).push(x)); // zaległe mecze nie blokują kolejki
  return Object.entries(by).filter(([, L]) => L.every(x => x.played || x.walkover || _ssResult({ demo: false }, x)?.done) && L.some(x => (x.matchIds || []).length)).map(([w]) => +w).sort((a, b) => b - a);
}
function _totwData(w) {
  const sid = currentSeasonId || null, ids = new Set((schedule || []).filter(x => x.generated && !x.makeup && (x.seasonId || null) === sid && +x.week === +w).flatMap(x => (x.matchIds || []).map(String)));
  const gs = p => (+p.pts || 0) + .4 * (+p.fgm || 0) - .7 * (+p.fga || 0) + 0.4 * (+p.reb || 0) + .7 * (+p.ast || 0) + (+p.stl || 0) + (+p.blk || 0) - (+p.to || 0);
  const by = {}; _withAllMatches(() => matches.filter(m => !m.walkover && ids.has(String(m.id)))).forEach(m => [m.team1, m.team2].forEach(t => (t.players || []).forEach(p => {
    const k = _normNick(p.name); if(!k) return; const a = by[k] = by[k] || { name: p.name, team: t.name, gp: 0, gs: 0, pts: 0, reb: 0, ast: 0, posN: {} }; a.gp++; a.gs += gs(p); a.pts += +p.pts || 0; a.reb += +p.reb || 0; a.ast += +p.ast || 0;
    const ps = String(p.pos || '').toUpperCase().split(/[\/,\s]+/)[0]; if(ps) a.posN[ps] = (a.posN[ps] || 0) + 1; })));
  // Piątka po pozycjach (jak grafika bota): na każdą pozycję najlepszy występ wśród grających głównie tam; brak → grający tam choć raz → najlepszy z pozostałych
  const list = Object.values(by).map(a => ({ ...a, avg: a.gs / a.gp, mainPos: Object.entries(a.posN).sort((x, y) => y[1] - x[1])[0]?.[0] || '' })).sort((a, b) => b.avg - a.avg), used = new Set();
  const pub = (window._totwPub || {})[(currentSeasonId || '') + ':' + w]; // opublikowana Piątka (karty limitowane, podcast) ma pierwszeństwo
  if(pub?.length) { const SL = ['PG', 'SG', 'SF', 'PF', 'C'], P = pub.slice(0, 5).map(p => ({ p, x: list.find(y => _normNick(y.name) === _normNick(p.name)) }));
    const mainPos = x => Object.entries(x?.posN || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || '', used = new Set(), bySlot = {};
    P.filter(e => SL.includes(e.p.slot)).forEach(e => { bySlot[e.p.slot] = e; used.add(e); }); // pozycja zapisana na karcie
    SL.filter(sl => !bySlot[sl]).forEach(sl => { const free = P.filter(e => !used.has(e)); const e = free.find(f => mainPos(f.x) === sl) || free.find(f => f.x?.posN?.[sl]) || free.sort((a, b) => (b.x?.avg || 0) - (a.x?.avg || 0))[0]; if(e) { bySlot[sl] = e; used.add(e); } }); // starsze karty: jak przy wyborze Piątki
    return SL.filter(sl => bySlot[sl]).map(sl => { const { p, x } = bySlot[sl]; return { ...(x || { name: p.name, team: p.team, gp: 0, gs: 0, pts: 0, reb: 0, ast: 0, avg: 0, posN: {} }), name: x?.name || p.name, team: x?.team || p.team, pos: sl, slot: sl, published: true }; }); }
  return ['PG', 'SG', 'SF', 'PF', 'C'].map(slot => { const free = list.filter(x => !used.has(x.name)); const x = free.find(y => y.mainPos === slot) || free.find(y => y.posN[slot]) || free[0]; if(!x) return null; used.add(x.name); return { ...x, pos: slot, slot }; }).filter(Boolean);
}
async function renderTotw() {
  const el = document.getElementById('totw-wrap'); if(!el) return;
  const weeks = _totwWeeks(); if(!weeks.length) { el.innerHTML = `<div class="card" style="padding:1rem;color:var(--muted)">${_g('Brak rozegranych kolejek w tym sezonie.', 'No rounds played this season yet.')}</div>`; return; }
  const w = weeks.includes(+_totwWeek) ? +_totwWeek : weeks[0], list = _totwData(w), f1 = v => (Math.round(v * 10) / 10).toString().replace('.', currentLang === 'en' ? '.' : ',');
  el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.8rem">
      <div style="font-size:.82rem;color:var(--muted)">${_g('5 najlepszych występów kolejki — średnia ocena występu na mecz. Karty pokazują statystyki z tej kolejki.', 'The 5 best performances of the round — average game score per game. Cards show stats from that round.')}</div>
      <select onchange="_totwWeek=this.value;renderTotw()" style="font-size:.82rem;padding:.3rem .5rem;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--text)">${weeks.map(x => `<option value="${x}" ${x === w ? 'selected' : ''}>Week ${x}</option>`).join('')}</select></div>
    <div id="totw-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:.7rem">${list.map((p, i) => `<div data-notr>
      <div id="totw-c${i}" style="aspect-ratio:4/5;border-radius:14px;background:var(--surface2);display:flex;align-items:center;justify-content:center;color:var(--muted)">⏳</div>
      <div style="text-align:center;margin-top:.35rem;font-size:.8rem"><b><span style="color:var(--accent)">${_h(p.slot || p.pos || '#' + (i + 1))}</span> ${_h(p.name)}</b><br><span style="color:var(--muted)">${_h(p.team)} · ${f1(p.pts / p.gp)} PTS · ${f1(p.reb / p.gp)} REB · ${f1(p.ast / p.gp)} AST</span></div></div>`).join('')}</div>`;
  for(const [i, p] of list.entries()) { // karty limitowane Piątki tygodnia (jak MVP): złota ramka, statystyki z tej kolejki, od razu holo; bez otwierania i pobierania
    const box = document.getElementById('totw-c' + i); if(!box) continue;
    try { const url = await _pcLimitedImage(p.name, `PIĄTKA TYGODNIA · WEEK ${w}`, `week:${currentSeasonId || ''}:${w}`, 'gold', 0, null);
      box.style.background = 'none'; box.style.aspectRatio = 'auto';
      box.innerHTML = url ? `<div oncontextmenu="return false" style="user-select:none;-webkit-touch-callout:none">${_holoHtml(url, p.name, 1)}</div>` : _h(p.name);
      box.querySelectorAll('img').forEach(im => { im.draggable = false; im.style.pointerEvents = 'none'; });
      _holoBind(box);
    } catch(e) { box.textContent = p.name; }
  }
}

// ═══ ⭐ FANTASY+ — zapowiedź (podgląd, opis, wpisowe) + ankieta ═══
// 🎮 DEMO LIGI GM — draft z botami i sezon na prawdziwych meczach ligi; wszystko w przeglądarce, nic nie trafia na serwer
const _GMD_BOTS = ['🤖 Bot Kobe', '🤖 Bot Shaq', '🤖 Bot Curry', '🤖 Bot LeBron', '🤖 Bot Dirk'];
let _gmd = null;
function _gmMeId(){return __lz(8,'_gmMeId',this,arguments)}
function _gmdPool(){return __lz(8,'_gmdPool',this,arguments)}
function gmDemoStart(){return __lz(8,'gmDemoStart',this,arguments)}
function _gmdTaken(){return __lz(8,'_gmdTaken',this,arguments)}
function _gmdAvail(){return __lz(8,'_gmdAvail',this,arguments)}
function _gmdNext(){return __lz(8,'_gmdNext',this,arguments)}
function gmDemoPick(){return __lz(8,'gmDemoPick',this,arguments)}
function gmDemoExit(){return __lz(8,'gmDemoExit',this,arguments)}
function _gmdDraw(){return __lz(8,'_gmdDraw',this,arguments)}
function gmDemoChoose(){return __lz(8,'gmDemoChoose',this,arguments)}
function _gdaN(){return __lz(8,'_gdaN',this,arguments)}
function _gdaMax(){return __lz(8,'_gdaMax',this,arguments)} function _gdaNextNom(){return __lz(8,'_gdaNextNom',this,arguments)}
function _gdaStartLot(){return __lz(8,'_gdaStartLot',this,arguments)}
function _gdaLoop(){return __lz(8,'_gdaLoop',this,arguments)}
function _gdaAdvance(){return __lz(8,'_gdaAdvance',this,arguments)}
function gmDemoNominate(){return __lz(8,'gmDemoNominate',this,arguments)}
function gmDemoBid(){return __lz(8,'gmDemoBid',this,arguments)}
function _gdaHtml(){return __lz(8,'_gdaHtml',this,arguments)}

// 📋 lista zawodników w demo: widok FP / statystyki / atrybuty (litery jak na kartach), sortowanie po kolumnie, karta po kliknięciu
const _GMD_ATTR = [['shoot', 'RZT', 'SHT'], ['three', '3PT', '3PT'], ['inside', 'POD', 'INS'], ['play', 'ROZ', 'PLY'], ['def', 'OBR', 'DEF'], ['reb', 'ZB', 'REB'], ['ball', 'KP', 'BAL']];
function _gmdInfo(){return __lz(8,'_gmdInfo',this,arguments)}
const _gmdGradeCol = g => /^A/.test(g) ? '#22c55e' : /^B/.test(g) ? '#84cc16' : /^C/.test(g) ? '#eab308' : /^D/.test(g) ? '#f97316' : '#ef4444';
function gmdSort(){return __lz(8,'gmdSort',this,arguments)}
function _gmdListHtml(){return __lz(8,'_gmdListHtml',this,arguments)}
function _gmdLotImg(){return __lz(8,'_gmdLotImg',this,arguments)}

function gmDemoSeason(){return __lz(8,'gmDemoSeason',this,arguments)}

async function renderFantasyPlus() {
  const el = document.getElementById('fplus-wrap'); if(!el) return;
  (() => { const box = document.getElementById('gmd-wrap'); if(!box || _gmd || box.dataset.choosing) return; // karta demo — poza obszarem nadpisywanym przez zakładkę
    box.innerHTML = `<div class="card" style="padding:1rem 1.1rem;border:2px solid var(--accent);background:linear-gradient(135deg,rgba(245,197,24,.14),rgba(59,130,246,.08))" data-notr>
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.35rem"><span style="background:#ef4444;color:#fff;font-size:.62rem;font-weight:800;padding:.1rem .4rem;border-radius:5px">NEW</span><b style="font-size:1.05rem">🎮 ${_g('Wypróbuj demo Ligi GM', 'Try the GM League demo')}</b></div>
      <div style="font-size:.84rem;line-height:1.55;color:var(--muted);margin-bottom:.7rem">${_g('Przejdź prawdziwy <b>draft</b> z 5 botami (zawodnicy naszej ligi, ich punkty fantasy), a potem zobacz <b>sezon od środka</b>: tabelę, pojedynki tygodnia, oceny i playoffy — liczone z prawdziwych meczów ligi. Nic się nie zapisuje, możesz grać ile chcesz.', 'Go through a real <b>draft</b> with 5 bots (our league players and their fantasy points), then see the <b>season from the inside</b>: standings, weekly matchups, ratings and playoffs — computed from real league games. Nothing is saved, play as often as you like.')}</div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn btn-primary" onclick="gmDemoChoose()">▶ ${_g('Uruchom demo', 'Start the demo')}</button><button class="btn btn-ghost" onclick="navigator.clipboard?.writeText(location.origin + '/gm-demo').then(()=>showToast('🔗 ' + _g('Skopiowano link do demo', 'Demo link copied'),'success'))">🔗 ${_g('Kopiuj link do demo', 'Copy demo link')}</button></div></div>`;
    if(window._gmdAuto) { window._gmdAuto = false; gmDemoChoose(); } })();
  const T = (pl, en) => _g(pl, en), pill = (t, c) => `<span style="display:inline-block;font-size:.66rem;font-weight:800;padding:.1rem .45rem;border-radius:6px;background:${c};color:#111">${t}</span>`;
  const screen = (title, body) => `<div style="border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--surface)"><div style="display:flex;align-items:center;gap:.35rem;padding:.4rem .6rem;background:var(--surface2);border-bottom:1px solid var(--border)"><span style="width:9px;height:9px;border-radius:50%;background:#ef4444"></span><span style="width:9px;height:9px;border-radius:50%;background:#f59e0b"></span><span style="width:9px;height:9px;border-radius:50%;background:#22c55e"></span><span style="font-size:.7rem;font-weight:700;color:var(--muted);margin-left:.4rem">${title}</span></div><div style="padding:.75rem">${body}</div></div>`;
  const h = t => `<div class="section-title" style="font-size:1.25rem;margin:1.3rem 0 .6rem">${t}</div>`;
  const steps = [['📝', T('Zapisy i wpisowe', 'Sign-up & entry fee'), T('Zgłaszasz się jako GM. Liczba miejsc jest ograniczona, a wpisowe zasila pulę nagród.', 'Sign up as a GM. Spots are limited and entry fees go to the prize pool.')],
    ['🔨', T('Aukcja draftowa na żywo', 'Live draft auction'), T('Każdy GM ma ten sam budżet. Zawodnicy ligi po kolei trafiają na licytację: kto da więcej, ten bierze. Czas na podbicie to kilka sekund, a każde podbicie go odnawia. Budżet = limit wynagrodzeń.', 'Every GM gets the same budget. League players go up for auction one by one — highest bid wins. A few seconds to raise, every raise resets the clock. Your budget is your salary cap.')],
    ['📅', T('Sezon: pojedynki co tydzień', 'Season: weekly matchups'), T('Co kolejkę mierzysz się z innym GM-em. Twoi zawodnicy zdobywają punkty za swoje prawdziwe mecze w lidze — wygrywa GM z większą sumą punktów.', 'Each round you face another GM. Your players score points from their real league games — the higher total wins.')],
    ['🔁', T('Rynek: wolni agenci i wymiany', 'Market: free agents & trades'), T('Wolnych agentów kupujesz w licytacji w ciemno (FAAB) — każdy GM oferuje kwotę, najwyższa oferta wygrywa. Z innymi GM-ami wymieniasz się zawodnikami; analizator pokazuje, czy wymiana się opłaca, a pozostali mogą ją zawetować.', 'Free agents are bought in blind bidding (FAAB) — highest offer wins. Trade players with other GMs; the analyzer shows if a deal pays off and other GMs can veto it.')],
    ['🏆', T('Playoffy i mistrz', 'Playoffs & champion'), T('Najlepsi GM-owie sezonu zasadniczego grają playoffy o tytuł i główną nagrodę.', 'The best regular-season GMs play the playoffs for the title and the top prize.')],
    ['🧬', T('Dynastia', 'Dynasty'), T('Po sezonie zatrzymujesz kilku zawodników (keeperów) na kolejny — budujesz drużynę na lata.', 'After the season you keep a few players (keepers) for the next one — build a team for years.')]];
  const SC = [[T('Punkt', 'Point'), '+1'], [T('Zbiórka', 'Rebound'), '+1,2'], [T('Asysta', 'Assist'), '+1,5'], [T('Przechwyt', 'Steal'), '+3'], [T('Blok', 'Block'), '+3'], [T('Strata', 'Turnover'), '−1'], [T('Wygrana drużyny', 'Team win'), '+2'], ['Double-double', '+3'], ['Triple-double', '+5'], [T('Ocena meczu A+ … F', 'Game grade A+ … F'), '+3 … −2']];
  el.innerHTML = `<div data-notr>
    <div class="card" style="padding:1.2rem 1.3rem;background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(245,197,24,.08))">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.9rem;letter-spacing:1px">⭐ FANTASY+ · ${T('LIGA MENEDŻERÓW', 'MANAGER LEAGUE')}</div>
      <div style="font-size:.95rem;margin-top:.45rem;max-width:820px;line-height:1.6">${T('Zwykłe fantasy to wybór piątki z budżetu. <b>Fantasy+</b> idzie dalej: jesteś <b>generalnym menedżerem</b> własnej drużyny przez cały sezon. Walczysz o zawodników ligi z innymi GM-ami na <b>aukcji na żywo</b>, pilnujesz <b>limitu wynagrodzeń</b>, negocjujesz <b>wymiany</b>, polujesz na wolnych agentów i co tydzień grasz <b>pojedynek</b> z innym GM-em. Każdy rzut, zbiórka i asysta Twoich zawodników w prawdziwych meczach ligi to punkty dla Ciebie.', 'Regular fantasy is picking a five within a budget. <b>Fantasy+</b> goes further: you are the <b>general manager</b> of your own team for the whole season. Fight other GMs for league players in a <b>live auction</b>, manage the <b>salary cap</b>, negotiate <b>trades</b>, hunt free agents and play a <b>weekly matchup</b> against another GM. Every shot, rebound and assist your players make in real league games is points for you.')}</div>
      <div style="margin-top:.7rem;font-size:.86rem">💰 ${T('<b>Wpisowe:</b> udział będzie płatny, a całe wpisowe trafi do puli nagród dla najlepszych GM-ów. Kwotę i podział nagród ogłosimy przed startem — zagłosuj w ankiecie na dole, czy wchodzisz.', '<b>Entry fee:</b> participation will be paid and all fees go to the prize pool for the best GMs. Amount and prize split will be announced before launch — vote in the poll below.')}</div></div>
    ${h('🗺️ ' + T('Jak wygląda sezon', 'How a season works'))}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.6rem">${steps.map(([e, t, d], i) => `<div class="card" style="padding:.75rem .85rem"><div style="font-size:.7rem;font-weight:800;color:var(--accent)">${T('KROK', 'STEP')} ${i + 1}</div><div style="font-weight:800;font-size:.95rem;margin:.15rem 0 .3rem">${e} ${t}</div><div style="font-size:.8rem;color:var(--muted);line-height:1.5">${d}</div></div>`).join('')}</div>
    ${h('🧮 ' + T('Punktacja zawodników', 'Player scoring'))}
    <div class="card" style="padding:.6rem .9rem"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:.1rem .9rem">${SC.map(([k, v]) => `<div style="display:flex;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid var(--border);font-size:.84rem"><span>${k}</span><b style="color:${v.startsWith('−') ? 'var(--loss)' : 'var(--accent)'}">${v}</b></div>`).join('')}</div>
      <div style="font-size:.74rem;color:var(--muted);margin-top:.45rem">${T('Przykład: 25 pkt, 8 zb., 6 as., 2 przechwyty, wygrana i ocena A- = 25 + 9,6 + 9 + 6 + 2 + 2 = <b>53,6 pkt</b>.', 'Example: 25 pts, 8 reb, 6 ast, 2 stl, a win and an A- grade = 25 + 9.6 + 9 + 6 + 2 + 2 = <b>53.6 pts</b>.')}</div></div>
    ${h('🖥️ ' + T('Tak to wygląda', 'What it looks like'))}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:.8rem">
      ${screen('🔨 ' + T('Pokój aukcji', 'Auction room'), `<div style="display:grid;grid-template-columns:1fr 120px;gap:.7rem">
        <div><div style="font-size:.7rem;color:var(--muted)">${T('Na licytacji · zawodnik 14/40', 'Up for bid · player 14/40')}</div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem">MaTT M2544</div><div style="font-size:.72rem;color:var(--muted)">ROW Rybnik · PG · ${T('Strzelec 3&D', '3&D shooter')}</div>
          <div style="display:flex;gap:.25rem;margin:.4rem 0">${[['RZUT', 'A-'], ['ZA 3', 'A'], ['ROZ', 'B+'], ['OBR', 'B'], ['ZB', 'B-']].map(([k, g]) => `<div style="flex:1;text-align:center;background:var(--surface2);border-radius:6px;padding:.2rem 0"><div style="font-size:.52rem;color:var(--muted)">${k}</div><b style="color:#86efac;font-size:.82rem">${g}</b></div>`).join('')}</div>
          <div style="display:flex;gap:.3rem"><button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .5rem">+$1</button><button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .5rem">+$5</button><button class="btn btn-primary" style="font-size:.7rem;padding:.2rem .5rem">${T('Podbij', 'Raise')} → $43</button></div></div>
        <div style="text-align:center"><div style="width:84px;height:84px;margin:0 auto;border-radius:50%;border:6px solid #f59e0b;display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem">0:08</div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.7rem;color:var(--accent);margin-top:.3rem">$42</div><div style="font-size:.66rem;color:var(--muted)">${T('prowadzi', 'leading')}: Sanki GM</div></div></div>
        <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.55rem;font-size:.66rem">${[['Lechu', 118], ['Sanki GM', 96], ['AsuRa', 133], ['Kozak', 71]].map(([n, b]) => `<span style="background:var(--surface2);border-radius:6px;padding:.15rem .4rem">${n} · <b>$${b}</b></span>`).join('')}</div>`)}
      ${screen('💵 ' + T('Mój skład i limit', 'My roster & cap'), `<div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:.3rem"><span>${T('Wynagrodzenia', 'Salaries')}</span><b>$186 / $200</b></div><div style="height:9px;background:var(--surface2);border-radius:5px;overflow:hidden;margin-bottom:.5rem"><div style="width:93%;height:100%;background:linear-gradient(90deg,#22c55e,#f59e0b)"></div></div>
        ${[['PG', 'MaTT M2544', 42, '38,4'], ['SG', 'Rvnm', 31, '29,1'], ['SF', 'llmorganll', 28, '31,7'], ['PF', 'San', 19, '18,2'], ['C', 'Wil', 24, '22,9'], ['🪑', 'Kozak', 12, '9,5']].map(([p, n, $, fp]) => `<div style="display:grid;grid-template-columns:28px 1fr 46px 46px;gap:.3rem;font-size:.78rem;padding:.22rem 0;border-bottom:1px solid var(--border)"><b style="color:var(--muted)">${p}</b><span>${n}</span><span style="color:var(--muted);text-align:right">$${$}</span><b style="text-align:right">${fp}</b></div>`).join('')}
        <div style="font-size:.66rem;color:var(--muted);margin-top:.3rem">${T('Ostatnia kolumna: średnia punktów na tydzień', 'Last column: average points per week')}</div>`)}
      ${screen('⚔️ ' + T('Pojedynek tygodnia', 'Weekly matchup'), `<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:.5rem;align-items:center;text-align:center;margin-bottom:.5rem"><div><div style="font-size:.74rem;color:var(--muted)">Lechu</div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2rem;color:var(--win)">152,4</div></div><b style="color:var(--muted)">vs</b><div><div style="font-size:.74rem;color:var(--muted)">AsuRa</div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2rem">138,9</div></div></div>
        ${[['MaTT M2544', '41,2', 'Rvnm', '35,0'], ['llmorganll', '33,5', 'San', '27,8'], ['Wil', '28,1', 'Kozak', '30,6'], ['San', '24,6', 'cichy_x', '22,4'], ['Kozak', '25,0', 'qLechu', '23,1']].map(([a, x, b, y]) => `<div style="display:grid;grid-template-columns:1fr 44px 10px 44px 1fr;gap:.25rem;font-size:.76rem;padding:.2rem 0;border-bottom:1px solid var(--border)"><span>${a}</span><b style="text-align:right">${x}</b><span></span><b>${y}</b><span style="text-align:right">${b}</span></div>`).join('')}
        <div style="font-size:.66rem;color:var(--muted);margin-top:.3rem">${T('Na żywo — punkty rosną z każdym wgranym meczem kolejki', 'Live — points grow with every game uploaded this round')}</div>`)}
      ${screen('🔁 ' + T('Wymiana z analizatorem', 'Trade with analyzer'), `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;font-size:.78rem"><div style="background:var(--surface2);border-radius:8px;padding:.45rem"><div style="font-size:.66rem;color:var(--muted)">${T('Oddajesz', 'You give')}</div><b>Rvnm</b> · $31</div><div style="background:var(--surface2);border-radius:8px;padding:.45rem"><div style="font-size:.66rem;color:var(--muted)">${T('Dostajesz', 'You get')}</div><b>Kozak</b> · $12 + <b>San</b> · $19</div></div>
        <div style="margin-top:.5rem;font-size:.76rem">${[[T('Rzut', 'Shooting'), 72, 64], [T('Rozgrywanie', 'Playmaking'), 58, 66], [T('Zbiórki', 'Rebounding'), 44, 61]].map(([k, a, b]) => `<div style="display:grid;grid-template-columns:86px 1fr;gap:.4rem;align-items:center;margin:.2rem 0"><span style="color:var(--muted)">${k}</span><div style="position:relative;height:8px;background:var(--surface2);border-radius:4px"><div style="position:absolute;inset:0;width:${a}%;background:rgba(148,163,184,.5);border-radius:4px"></div><div style="position:absolute;top:2px;height:4px;width:${b}%;background:#f5c518;border-radius:2px"></div></div></div>`).join('')}</div>
        <div style="font-size:.78rem;margin-top:.4rem">${T('Prognoza / tydzień', 'Projection / week')}: <b style="color:var(--win)">+6,4 pkt</b> · ${T('limit', 'cap')}: <b>$186 → $186</b> · ⚖️ <b style="color:#f59e0b">${T('uczciwa', 'fair')}</b></div>
        <div style="font-size:.66rem;color:var(--muted);margin-top:.25rem">${T('Szare — przed wymianą, żółte — po. Inni GM-owie mają czas na weto.', 'Grey — before, yellow — after. Other GMs get time to veto.')}</div>`)}
      ${screen('📊 ' + T('Tabela GM-ów', 'GM standings'), `${[['Lechu', '6-1', '1 024,6'], ['AsuRa', '5-2', '987,1'], ['Sanki GM', '4-3', '941,0'], ['Kozak', '3-4', '902,3'], ['cichy_x', '2-5', '866,8'], ['qLechu', '1-6', '801,2']].map(([n, r, p], i) => `<div style="display:grid;grid-template-columns:22px 1fr 44px 64px;gap:.3rem;font-size:.78rem;padding:.25rem 0;border-bottom:1px solid ${i === 3 ? '#f5c518' : 'var(--border)'}"><b style="color:var(--muted)">${i + 1}</b><span>${n}</span><span>${r}</span><b style="text-align:right">${p}</b></div>`).join('')}<div style="font-size:.66rem;color:var(--muted);margin-top:.3rem">${T('Żółta linia — awans do playoffów', 'Yellow line — playoff spots')}</div>`)}
    </div>
    ${h('❓ ' + T('Najczęstsze pytania', 'FAQ'))}
    <div class="card" style="padding:.7rem .9rem;font-size:.82rem;line-height:1.55">${[[T('Czy muszę być na aukcji na żywo?', 'Do I have to attend the auction live?'), T('Tak — aukcja to najważniejszy wieczór sezonu. Termin ustalimy z wyprzedzeniem tak, żeby jak najwięcej GM-ów mogło być na żywo.', 'Yes — the auction is the big night of the season. We\u2019ll set the date in advance so as many GMs as possible can be there live.')],
      [T('Czy mogę mieć zawodników z mojej drużyny?', 'Can I own players from my own team?'), T('O tym decyduje admin w ustawieniach ligi (np. zakaz brania siebie).', 'The admin decides in league settings (e.g. no picking yourself).')],
      [T('Co, jeśli mój zawodnik nie gra w danym tygodniu?', 'What if my player doesn\u2019t play that week?'), T('Zdobywa 0 pkt — dlatego warto mieć ławkę i reagować na rynku.', 'He scores 0 — that\u2019s why a bench and market moves matter.')]].map(([q, a]) => `<div style="padding:.35rem 0;border-bottom:1px solid var(--border)"><b>${q}</b><br><span style="color:var(--muted)">${a}</span></div>`).join('')}</div>
    <div class="card" style="padding:.9rem 1rem;margin-top:1rem" id="fplus-poll">⏳</div></div>`;
  const r = await _api('/poll?id=fantasyplus', 'GET', null, discordUser?.session ? { session: true } : {}); _fplusPoll(r);
}

function _fplusPoll(){return __lz(8,'_fplusPoll',this,arguments)}
function fplusVoters(){return __lz(8,'fplusVoters',this,arguments)}
function fplusVote(){return __lz(8,'fplusVote',this,arguments)}
function _evCurrent(){return __lz(8,'_evCurrent',this,arguments)}
function openCurrentDraft(){return __lz(8,'openCurrentDraft',this,arguments)}
function _openRegisterLink(){return __lz(8,'_openRegisterLink',this,arguments)}
function _openFaLink(){return __lz(8,'_openFaLink',this,arguments)}
function goJoin(){return __lz(8,'goJoin',this,arguments)}

// ═══ 🗳️ GŁOSOWANIE TYGODNIA — bieżące głosowanie + archiwum (zwycięzcy, karty MVP i obrońcy, link do meczu) ═══
let _awArchId = null;
function hallOfFameHtml(){return __lz(8,'hallOfFameHtml',this,arguments)}

function renderAwardsView(){return __lz(8,'renderAwardsView',this,arguments)}

// ═══ 📣 DASHBOARD: OGŁOSZENIA (nagrody, MVP z kartą, Piątka tygodnia, linki, zapisy, drafty) ═══
async function renderDashNews() {
  let el = document.getElementById('dash-news'); if(!el) return;
  const sid = currentSeasonId || null, aw = (awardsList || []).filter(a => a.status === 'closed' && a.winners && (!sid || !a.seasonId || a.seasonId === sid)).sort((a, b) => (+b.week || 0) - (+a.week || 0))[0];
  const tw = _totwWeeks()[0], top = tw ? _totwData(tw) : [], evOpen = (events || []).filter(e => ['open', 'signup', 'registration'].includes(e.status) || e.signupsOpen);
  const box = (inner, extra = '') => `<div class="card" style="padding:.75rem .9rem;${extra}">${inner}</div>`, hd = t => `<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">${t}</div>`;
  el.innerHTML = `<div class="section-title" style="font-size:1.3rem">📣 ${_g('Ogłoszenia', 'News')}</div>
    <div data-notr style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.8rem;margin-bottom:1.5rem">
      ${aw ? box(`${hd('🏅 ' + _h(_awTitle(aw.title)).toUpperCase())}<div style="display:flex;gap:.7rem;align-items:flex-start">
          <div id="dn-mvp" style="width:120px;flex-shrink:0;aspect-ratio:4/5;border-radius:10px;background:var(--surface2)"></div>
          <div style="font-size:.82rem;line-height:1.55">${aw.categories.filter(c => aw.winners[c.key]).map(c => `<div>${c.emoji || '🏅'} <span style="color:var(--muted)">${_h(_awCat(c))}:</span> <b>${_h(aw.winners[c.key].label)}</b></div>`).join('')}
            <button class="btn btn-ghost" style="font-size:.7rem;margin-top:.4rem" onclick="showView('awards')">${_g('Wszystkie nagrody →', 'All awards →')}</button></div></div>`) : ''}
      ${top.length ? box(`${hd('🏆 ' + _g('PIĄTKA TYGODNIA', 'TEAM OF THE WEEK') + ' · WEEK ' + tw)}${top.map((p, i) => `<div style="display:flex;justify-content:space-between;gap:.5rem;font-size:.82rem;padding:.18rem 0"><span>${['🥇', '🥈', '🥉', '4.', '5.'][i]} <b>${_h(p.name)}</b> <span style="color:var(--muted)">${_h(p.team)}</span></span><span style="color:var(--muted)">${Math.round(p.pts / p.gp)} PTS</span></div>`).join('')}
          <button class="btn btn-ghost" style="font-size:.7rem;margin-top:.4rem" onclick="showView('totw')">${_g('Zobacz karty →', 'See the cards →')}</button>`) : ''}
      ${box(`${hd('🤝 ' + _g('DOŁĄCZ', 'JOIN US'))}
          ${!registrationsClosed ? `<button class="btn btn-primary" style="font-size:.78rem;width:100%;margin-bottom:.45rem" onclick="goJoin('teams')">🧢 ${_g('Zapisy do ligi otwarte — zgłoś drużynę', 'League sign-ups open — register your team')}</button>` : `<div style="font-size:.84rem;margin-bottom:.5rem">🧢 ${_g('Zapisy do ligi EU — <b>wkrótce</b>', 'EU league sign-ups — <b>coming soon</b>')}</div>`}
          ${evOpen.map(e => `<button class="btn btn-ghost" style="font-size:.74rem;width:100%;margin-bottom:.35rem" onclick="openEventDetail('${_h(e.id)}')">📝 ${_g('Zapisy na draft', 'Draft sign-ups')}: ${_h(e.name || e.title || '')}</button>`).join('')}
          <div style="display:flex;gap:.4rem;margin-top:.2rem"><a class="btn btn-ghost" style="flex:1;font-size:.74rem;text-decoration:none;text-align:center" href="${_discordInvite()}" target="_blank" rel="noopener">💬 Discord</a><a class="btn btn-ghost" style="flex:1;font-size:.74rem;text-decoration:none;text-align:center" href="${document.getElementById('x-link')?.href || 'https://x.com/ChemikLeague2K'}" target="_blank" rel="noopener">𝕏 X</a></div>`)}
    </div>`;
  if(aw?.winners?.mvp) { const w = aw.winners.mvp, scope = aw.week ? `week:${aw.seasonId || sid || ''}:${aw.week}` : null;
    try { const url = await _pcLimitedImage(w.label, `MVP · ${String(aw.title || '').toUpperCase()}`, scope, 'gold', 0, null), b = document.getElementById('dn-mvp'); if(url && b) b.innerHTML = `<img src="${url}" alt="${_h(w.label)}" style="width:100%;border-radius:10px;display:block;cursor:pointer" onclick="showView('awards')">`; } catch(e) {} }
}
// 🏛 pasek rekordów ligi (przewijany)
function renderRecordsTicker() {
  const el = document.getElementById('dash-ticker'); if(!el) return;
  const all = _withAllMatches(() => matches.filter(m => !m.walkover)), best = {};
  const put = (k, v, html) => { if(v > (best[k]?.v ?? -1)) best[k] = { v, html }; };
  all.forEach(m => [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, o]) => {
    put('team', +t.score || 0, `🔥 ${_g('Najwięcej punktów drużyny', 'Most team points')}: <b>${_h(t.name)}</b> ${t.score} vs ${_h(o.name)}`);
    put('margin', (+t.score || 0) - (+o.score || 0), `💥 ${_g('Najwyższa wygrana', 'Biggest win')}: <b>${_h(t.name)}</b> ${t.score}:${o.score} ${_h(o.name)}`);
    (t.players || []).forEach(p => [['pts', '🏀', _g('punktów', 'points')], ['reb', '💪', _g('zbiórek', 'rebounds')], ['ast', '🎯', _g('asyst', 'assists')], ['stl', '🦊', _g('przechwytów', 'steals')], ['blk', '🧱', _g('bloków', 'blocks')]].forEach(([k, e, l]) => put(k, +p[k] || 0, `${e} <b>${_h(p.name)}</b> — ${+p[k] || 0} ${l} vs ${_h(o.name)}`)));
  }));
  const items = Object.values(best).filter(x => x.v > 0).map(x => `<span style="padding:0 1.6rem;white-space:nowrap">${x.html}</span>`).join('');
  el.innerHTML = items ? `<div class="ticker" onclick="_recordsEdition=undefined;openLeagueRecordsModal()" title="${_g('Wszystkie rekordy', 'All records')}"><span class="ticker-lbl">🏛 ${_g('REKORDY LIGI', 'LEAGUE RECORDS')}</span><div class="ticker-mask"><div class="ticker-track">${items}${items}</div></div></div>` : '';
}
// układ Dashboardu: kolejność bloków
function _dashLayout() {
  const v = document.getElementById('view-dashboard'); if(!v || v.dataset.layout) return; v.dataset.layout = '1';
  const top = id => { const e = document.getElementById(id); if(!e) return null; let x = e; while(x && x.parentElement !== v) x = x.parentElement; return x; };
  const mk = id => { let e = document.getElementById(id); if(!e) { e = document.createElement('div'); e.id = id; v.appendChild(e); } return e; };
  const std = top('standings-body'), sum = top('leaders-grid'), totwOld = top('team-of-week-wrap');
  const order = [mk('eu-billboard'), ...(EU_MODE ? [mk('dash-news'), mk('eu-teams')] : []), top('live-wrap'), top('schedule-dashboard'), std?.previousElementSibling, std, top('penalties-note'), ...(EU_MODE ? [] : [mk('dash-news')]), top('awards-dashboard-wrap'), top('events-dashboard-wrap'), top('playoff-dashboard-wrap'), top('bracket-wrap'),
    mk('dash-ticker'), top('power-ranking-wrap'), top('elo-wrap'), sum?.previousElementSibling, sum, top('dashboard-extras'), top('classics-wrap'), top('mvp-race-wrap'), top('scenario-wrap'), top('ach-wrap'), top('quicklinks-wrap')].filter(Boolean);
  order.forEach(e => v.appendChild(e)); // pozostałe bloki zostają na końcu
  [top('league-hero'), totwOld, totwOld?.previousElementSibling?.id ? null : totwOld?.previousElementSibling, top('records-banner-wrap')].filter(Boolean).forEach(e => { e.style.display = 'none'; }); // stary baner, stara „najlepsza piątka”, pasek nowych rekordów → zastąpione
  ['records-banner-wrap', 'milestone-banner', 'round-comparison-wrap', 'event-ratings-wrap'].map(top).filter(Boolean).forEach(e => v.appendChild(e));
}

function _addTeamPlan(){return __lz(8,'_addTeamPlan',this,arguments)}
function openAddTeamToSchedule(){return __lz(8,'openAddTeamToSchedule',this,arguments)}
function _atForm(){return __lz(8,'_atForm',this,arguments)}
function addTeamPreview(){return __lz(8,'addTeamPreview',this,arguments)}
function addTeamApply(){return __lz(8,'addTeamApply',this,arguments)}

// ═══ 🇪🇺 EU CHEMIK LEAGUE — baner na stronie głównej, przełącznik lig, Dashboard EU, Rules, płatność wpisowego ═══
function _signup() { return window._signupInfo || {}; }
const TEAM_LEVELS = ['Tryhard D1', 'D1 Participants', 'D2 Champions', 'D2 Top 4', 'D2 Playoff Players', 'D2', 'New Teams'];
const FA_EU_LEVELS = ['New to 5s', 'Low D2 experience', 'Playoffs D2 experience', 'D2 finalists experience', 'D1 experience', 'FIBA experience']; // poziomy wolnych agentów (liga EU)
const _levelBadge = r => r.level ? `<span style="background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;border-radius:4px;padding:.05rem .35rem;font-size:.6rem;font-weight:800">📶 ${_h(r.level)}</span>` : '';
function renderEuBillboard() {
  const el = document.getElementById('eu-billboard'); if(!el) return;
  const s = _signup(); if(EU_MODE || s.euBanner === false) { el.innerHTML = ''; return; }
  const url = s.euUrl || EU_SITE;
  el.innerHTML = `<a href="${_h(url)}" class="eu-bb" data-notr>
    <div class="eu-bb-stars">${'★'.repeat(12).split('').map((x, i) => `<span style="transform:rotate(${i * 30}deg) translateY(-62px)">★</span>`).join('')}</div>
    <div class="eu-bb-txt"><div class="eu-bb-k">🇪🇺 EU CHEMIK LEAGUE</div><div class="eu-bb-h">SIGN UPS ARE OPEN</div>
      <div class="eu-bb-s">${_h(s.euText || ('NBA 2K Pro-Am · ' + (s.fee || '25€') + ' per team · register your team now'))}</div></div>
    <div class="eu-bb-cta">REGISTER →</div></a>`;
}
function _leagueSwitchHtml() {
  return `<select class="sn-league" onchange="location.href=this.value" title="League">
    <option value="${MAIN_SITE}" ${EU_MODE ? '' : 'selected'}>🇵🇱 2K Pro-Am Ekstraklasa</option>
    <option value="${_h(_signup().euUrl || EU_SITE)}" ${EU_MODE ? 'selected' : ''}>🇪🇺 EU Chemik League</option></select>`;
}
// 📜 Rules
function _rulesExist() { const s = _signup(); return !!(s.rulesText || s.rulesUrl); }
// 📜 regulamin: prosty markdown (# ## ### nagłówki, - listy, **pogrubienie**, *kursywa*, --- linia, linki) + spis treści
function _rulesMd(src) {
  const inl = t => _h(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<i>$2</i>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:var(--accent)">$1</a>');
  const toc = [], out = []; let list = null, n = 0;
  const flush = () => { if(list) { out.push(`<ul style="margin:.3rem 0 .6rem;padding-left:1.25rem">${list.join('')}</ul>`); list = null; } };
  String(src).split('\n').forEach(raw => { const l = raw.replace(/\s+$/, ''), m = l.match(/^(#{1,3})\s+(.*)$/);
    if(m) { flush(); const lvl = m[1].length, id = 'rl-' + (++n), text = inl(m[2]); if(lvl <= 2) toc.push({ id, lvl, text: text.replace(/<[^>]+>/g, '') });
      out.push(lvl === 1 ? `<div id="${id}" style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem;letter-spacing:1px;color:var(--accent);margin:1.4rem 0 .4rem;padding-top:.6rem;border-top:2px solid var(--accent);scroll-margin-top:80px">${text}</div>`
        : lvl === 2 ? `<div id="${id}" style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.22rem;letter-spacing:.5px;margin:1.1rem 0 .35rem;scroll-margin-top:80px">${text}</div>`
        : `<div style="font-weight:800;font-size:.95rem;margin:.8rem 0 .25rem">${text}</div>`); return; }
    if(/^\s*[-•*]\s+/.test(l) && !/^\*\*/.test(l.trim())) { (list = list || []).push(`<li style="margin:.2rem 0">${inl(l.replace(/^\s*[-•*]\s+/, ''))}</li>`); return; }
    if(!l.trim()) return; // pusta linia nie przerywa listy
    flush();
    if(/^-{3,}$/.test(l.trim())) { out.push('<hr style="border:none;border-top:1px solid var(--border);margin:1rem 0">'); return; }
    if(l.trim()) out.push(`<p style="margin:.35rem 0">${inl(l)}</p>`); });
  flush(); return { html: out.join(''), toc };
}
function renderRules() {
  const el = document.getElementById('rules-wrap'); if(!el) return; const s = _signup(), en = currentLang === 'en';
  if(!window._signupLoaded && !s.rulesText && !s.rulesUrl) { el.innerHTML = `<div class="card" style="padding:1rem;color:var(--muted)">⏳ ${_g('Wczytuję regulamin…', 'Loading the rules…')}</div>`; return; }
  const { html: txt, toc } = _rulesMd(s.rulesText || '');
  const reg = `<div class="card" style="padding:1rem 1.1rem;margin-bottom:1rem;background:linear-gradient(135deg,rgba(0,51,153,.28),rgba(255,204,0,.08))" data-notr>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:.8rem;flex-wrap:wrap">
        <div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;line-height:1.1">🧢 ${registrationsClosed ? _g('Zapisy drużyn są zamknięte', 'Team sign-ups are closed') : _g('Zgłoś swoją drużynę', 'Register your team')}</div>
          <div style="font-size:.84rem;color:var(--muted);margin-top:.2rem">${_g('Wpisowe', 'Entry fee')}: <b style="color:var(--text)">${_h(s.fee || '25€')}</b> ${_g('za drużynę', 'per team')} · ${_g('min. 5 zawodników · kapitan akceptuje regulamin w imieniu drużyny', 'min. 5 players · the captain accepts the rules on behalf of the team')}</div></div>
        ${registrationsClosed ? '' : `<button class="btn btn-primary" onclick="_openRegisterLink()">🧢 ${_g('Zgłoś drużynę', 'Register your team')}</button>`}</div></div>`;
  el.innerHTML = reg + _captainGuideHtml() + `<div class="section-title" style="font-size:1.25rem;margin-top:1.4rem">📜 ${_g('Regulamin', 'Rules')}</div>
    <div class="card" style="padding:1rem 1.2rem;line-height:1.55;font-size:.9rem" data-notr>
    ${s.rulesUrl ? `<a class="btn btn-primary" href="${_h(s.rulesUrl)}" target="_blank" rel="noopener" style="text-decoration:none;display:inline-block;margin-bottom:.8rem">📄 ${_g('Otwórz pełny regulamin', 'Open the full rulebook')}</a>` : ''}
    ${toc.length > 2 ? `<div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.9rem;padding-bottom:.8rem;border-bottom:1px solid var(--border)">${toc.map(t => `<a href="#" onclick="document.getElementById('${t.id}')?.scrollIntoView({behavior:'smooth',block:'start'});return false" style="font-size:.72rem;text-decoration:none;color:${t.lvl === 1 ? '#111' : 'var(--text)'};background:${t.lvl === 1 ? 'var(--accent)' : 'var(--surface2)'};border:1px solid var(--border);border-radius:999px;padding:.15rem .55rem;font-weight:${t.lvl === 1 ? 800 : 600}">${t.text}</a>`).join('')}</div>` : ''}
    ${txt || (!s.rulesUrl ? `<div style="color:var(--muted)">${_g('Regulamin pojawi się wkrótce.', 'The rules will be published soon.')}</div>` : '')}</div>`;
}
// 🧢 przewodnik kapitana: skład, Discord, łączenie kont, wpisowe
function _captainGuideHtml() {
  const s = _signup(), inv = _discordInvite();
  const steps = EU_MODE || currentLang === 'en' ? [
    ['🧢', 'Register your team', `Log in with Discord (top of the page) → <b>Join us → League sign-ups</b> → <b>Register a team</b>. Enter the team name, logo, your team’s X profile and <b>at least 5 players</b> (gamertag, platform and their X profile). Accept the rules and send.`],
    ['💶', 'Pay the entry fee', `${_h(s.fee || '25€')} per team${_payMethod(s) === 'skrill' ? ` via <b>Skrill</b> (to ${_h(s.skrillEmail)})` : _payMethod(s) === 'revolut' ? ` via <a href="${_h(s.revolutUrl)}" target="_blank" rel="noopener" style="color:var(--accent)">Revolut</a>` : ''}. Write your <b>team name</b> in the payment description, then upload a screenshot of the transfer on your team card (<b>💶 Entry fee</b>)${s.dmAccount ? ` or send it in a DM on Discord to <b>${_h(s.dmAccount)}</b>` : ''}.`],
    ['💬', 'Invite your players to Discord', `Send every player the server invite: <a href="${_h(inv)}" target="_blank" rel="noopener" style="color:var(--accent)">${_h(inv)}</a>. All players must be on the server.`],
    ['🔗', 'Each player links their account', `Every player opens the site, clicks <b>Log in</b> (Discord) → <b>My panel</b> → section <b>🎮 My player profile</b> → picks the <b>team</b> and <b>their nick from the roster</b> → <b>Save</b>.`],
    ['✅', 'Confirm your players', `You’ll see their requests in <b>My panel</b> — confirm each one. Missing a player in the roster? Use <b>roster change</b> on your team card or ask an admin.`]] : [
    ['🧢', 'Zgłoś drużynę', 'Zaloguj się przez Discord → <b>Dołącz → Zapisy do ligi</b> → <b>Zgłoś drużynę</b>. Nazwa, logo, profil X drużyny i <b>min. 5 zawodników</b> (gamertag, platforma, profil X). Zaakceptuj regulamin i wyślij.'],
    ['💬', 'Zaproś graczy na Discorda', `Wyślij każdemu zaproszenie: <a href="${_h(inv)}" target="_blank" rel="noopener" style="color:var(--accent)">${_h(inv)}</a>.`],
    ['🔗', 'Każdy gracz łączy konto', 'Gracz wchodzi na stronę → <b>Zaloguj</b> (Discord) → <b>Mój panel</b> → <b>🎮 Mój profil gracza</b> → drużyna i swój nick → <b>Zapisz</b>.'],
    ['✅', 'Potwierdź graczy', 'Prośby graczy zobaczysz w <b>Moim panelu</b> — potwierdź każdą.']];
  return `<div class="section-title" style="font-size:1.2rem;margin-top:.4rem">🧭 ${_g('Przewodnik kapitana', 'Captain’s guide')}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:.6rem" data-notr>${steps.map(([e, t, d], i) => `<div class="card" style="padding:.7rem .8rem"><div style="font-size:.68rem;font-weight:800;color:var(--accent)">${_g('KROK', 'STEP')} ${i + 1}</div><div style="font-weight:800;margin:.15rem 0 .3rem">${e} ${t}</div><div style="font-size:.8rem;color:var(--muted);line-height:1.5">${d}</div></div>`).join('')}</div>`;
}
// 💶 wpisowe: Revolut, kod QR, zrzut przelewu
// 💶 PRZYPOMNIENIE O WPISOWYM — wspólna logika szablonu (ten sam kod na stronie i w Workerze: podgląd = wysłana wiadomość)
function payRemindDeadlineTxt(d, en) { if (!/^\d{4}-\d{2}-\d{2}$/.test(String(d || ''))) return ''; const x = new Date(d + 'T12:00:00Z'); return isNaN(x) ? '' : x.toLocaleDateString(en ? 'en-GB' : 'pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); }
function payRemindDetails(){return __lz(8,'payRemindDetails',this,arguments)}
function payRemindRender(){return __lz(8,'payRemindRender',this,arguments)}
function payRemindDefault(){return __lz(8,'payRemindDefault',this,arguments)}
// 📣 PRZYPOMNIENIE O WPISOWYM (admin) — wybór drużyn, termin, szablon do edycji, podgląd 1:1 z wysyłaną wiadomością
let _pr = null;
function _prTeams() { const sid = currentSeasonId || null; return (teamRegistrations || []).filter(r => r.status !== 'rejected' && r.payment?.status !== 'paid' && (!sid || !r.seasonId || r.seasonId === sid)); }
function _prAgo(){return __lz(8,'_prAgo',this,arguments)}
function openPayRemind(){return __lz(8,'openPayRemind',this,arguments)}
function _prVars(){return __lz(8,'_prVars',this,arguments)}
function _prMd(){return __lz(8,'_prMd',this,arguments)}
function _prDraw(){return __lz(8,'_prDraw',this,arguments)}
function _prPreview(){return __lz(8,'_prPreview',this,arguments)}
function _prIns(){return __lz(8,'_prIns',this,arguments)}
function payRemindAuto(){return __lz(8,'payRemindAuto',this,arguments)}
function payRemindSend(){return __lz(8,'payRemindSend',this,arguments)}
function openMyPayment(){return __lz(8,'openMyPayment',this,arguments)}

function _payBadge(r) { const st = r.payment?.status; if(!st) return ''; return st === 'paid' ? `<span style="background:#16a34a;color:#fff;border-radius:4px;padding:.1rem .4rem;font-size:.65rem;font-weight:700">💶 ${_g('OPŁACONE', 'PAID')}</span>` : st === 'sent' ? `<span style="background:#f59e0b;color:#111;border-radius:4px;padding:.1rem .4rem;font-size:.65rem;font-weight:700">🧾 ${_g('PRZELEW WYSŁANY', 'PROOF SENT')}</span>` : `<span style="background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:.1rem .4rem;font-size:.65rem;font-weight:700">💶 ${_g('NIEOPŁACONE', 'UNPAID')}</span>`; }
function _qrLoad(){return __lz(8,'_qrLoad',this,arguments)}
// 💶 metoda płatności wpisowego: Skrill (e-mail) albo Revolut (link) — wybór w ustawieniach zapisów
function _payMethod(s) { s = s || _signup(); const m = s.payMethod || (s.skrillEmail ? 'skrill' : s.revolutUrl ? 'revolut' : ''); return m === 'skrill' && s.skrillEmail ? 'skrill' : m === 'revolut' && s.revolutUrl ? 'revolut' : s.skrillEmail ? 'skrill' : s.revolutUrl ? 'revolut' : ''; }
function _skrillBoxHtml(){return __lz(8,'_skrillBoxHtml',this,arguments)}
function openTeamPayment(){return __lz(8,'openTeamPayment',this,arguments)}
function uploadPayment(){return __lz(8,'uploadPayment',this,arguments)}
function openPayments(){return __lz(8,'openPayments',this,arguments)}
function payProof(){return __lz(8,'payProof',this,arguments)}
function payConfirm(){return __lz(8,'payConfirm',this,arguments)}
function openSignupSettings(){return __lz(8,'openSignupSettings',this,arguments)}
function signupSave(){return __lz(8,'signupSave',this,arguments)}
// 🇪🇺 Dashboard EU: ogłoszenia + zgłoszone drużyny na górze; pozostałe sekcje widoczne, ale puste
function renderEuDash() {
  if(!EU_MODE) return;
  const s = _signup(), sid = currentSeasonId || null, regs = (teamRegistrations || []).filter(r => r.status !== 'rejected' && (!sid || !r.seasonId || r.seasonId === sid));
  const news = document.getElementById('dash-news');
  if(news) news.innerHTML = `<div class="section-title" style="font-size:1.3rem">📣 News</div>
    <div data-notr style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.8rem;margin-bottom:1.5rem">
      <div class="card" style="padding:.9rem 1rem;background:linear-gradient(135deg,rgba(0,51,153,.35),rgba(255,204,0,.08))"><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:#ffcc00">🇪🇺 EU CHEMIK LEAGUE</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem;line-height:1.1;margin:.2rem 0">${registrationsClosed ? 'SIGN UPS ARE CLOSED' : 'SIGN UPS ARE OPEN'}</div>
        <div style="font-size:.84rem;color:var(--muted)">NBA 2K Pro-Am · entry fee <b style="color:var(--text)">${_h(s.fee || '25€')}</b> per team</div>
        ${!registrationsClosed ? `<button class="btn btn-primary" style="margin-top:.6rem" onclick="goJoin('teams');setTimeout(openTeamRegModal,200)">🧢 Register your team</button>` : ''}</div>
      <div class="card" style="padding:.9rem 1rem"><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">📌 HOW TO JOIN</div>
        <div style="font-size:.82rem;line-height:1.6">1. Read the <a href="#" onclick="showView('rules');return false" style="color:var(--accent)">rules</a><br>2. Register your team (min. 5 players)<br>3. Pay ${_h(s.fee || '25€')} and upload the proof<br>4. Invite your players to Discord and link accounts</div>
        <button class="btn btn-ghost" style="font-size:.72rem;margin-top:.45rem" onclick="showView('rules')">📜 Rules & captain’s guide</button></div>
      <div class="card" style="padding:.9rem 1rem"><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">💬 COMMUNITY</div>
        <div style="display:flex;flex-direction:column;gap:.4rem"><a class="btn btn-ghost" style="text-decoration:none;text-align:center" href="${_discordInvite()}" target="_blank" rel="noopener">💬 Discord</a><a class="btn btn-ghost" style="text-decoration:none;text-align:center" href="${document.getElementById('x-link')?.href || 'https://x.com'}" target="_blank" rel="noopener">𝕏 X</a></div></div>
    </div>`;
  const tm = document.getElementById('eu-teams');
  const _card = r => `<div class="card" style="padding:.6rem .75rem"><div style="display:flex;gap:.6rem;align-items:center">
      ${r.logo ? `<img src="${r.logo}" style="width:42px;height:42px;border-radius:8px;object-fit:cover">` : `<div style="width:42px;height:42px;border-radius:8px;background:var(--surface2);display:flex;align-items:center;justify-content:center">🏀</div>`}
      <div style="min-width:0"><div style="font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_h(r.teamName)}</div><div style="font-size:.72rem;color:var(--muted)">${(r.players || []).length} players${r.xHandle ? ` · <a href="https://x.com/${_h(r.xHandle)}" target="_blank" rel="noopener" style="color:var(--accent)">@${_h(r.xHandle)}</a>` : ''}</div>
        <div style="margin-top:.2rem;display:flex;gap:.25rem;flex-wrap:wrap">${r.status === 'approved' ? '<span style="background:#16a34a;color:#fff;border-radius:4px;padding:.05rem .35rem;font-size:.6rem;font-weight:700">APPROVED</span>' : '<span style="background:var(--accent);color:#111;border-radius:4px;padding:.05rem .35rem;font-size:.6rem;font-weight:700">PENDING</span>'} ${_levelBadge(r)} ${_payBadge(r) || (_needFee() ? _payBadge({ payment: { status: 'unpaid' } }) : '')}</div></div></div>${_euRosterHtml(r)}</div>`;
  const okT = regs.filter(r => r.status === 'approved' || r.payment?.status === 'paid'), waitT = regs.filter(r => !okT.includes(r));
  const grid = L => `<div data-notr style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:.6rem;margin-bottom:1.5rem;align-items:start">${L.map(_card).join('')}</div>`;
  if(tm) tm.innerHTML = `<div class="section-title" style="font-size:1.3rem">✅ Confirmed teams <span style="color:var(--muted);font-size:1rem">(${okT.length})</span></div>
    <div style="font-size:.8rem;color:var(--muted);margin:-.4rem 0 .6rem">Entry fee paid — spot in the league secured.</div>
    ${okT.length ? grid(okT) : `<div class="card" style="padding:.9rem;color:var(--muted);margin-bottom:1.5rem">No confirmed teams yet — pay your entry fee to be the first! 💶</div>`}
    ${waitT.length || !regs.length ? `<div class="section-title" style="font-size:1.3rem">⏳ Awaiting payment <span style="color:var(--muted);font-size:1rem">(${waitT.length})</span></div>
    <div style="font-size:.8rem;color:var(--muted);margin:-.4rem 0 .6rem">Registered — the entry fee is not confirmed yet.${waitT.some(r => r.payment?.status === 'sent') ? ' 🧾 Proof sent = being checked by an admin.' : ''}</div>
    ${waitT.length ? grid(waitT) : `<div class="card" style="padding:.9rem;color:var(--muted);margin-bottom:1.5rem">No teams yet — be the first! 🏀</div>`}` : ''}`;
  _euPlaceholders();
}
function _euPlaceholders() {
  if(!EU_MODE) return;
  const ph = (t, d) => `<div class="section-title" style="font-size:1.3rem">${t}</div><div class="card" style="padding:1rem;color:var(--muted);font-size:.86rem;margin-bottom:1.5rem;border-style:dashed">${d || 'No data yet — the season hasn’t started.'}</div>`;
  [['schedule-dashboard', '📅 Upcoming games', 'The schedule will appear once sign-ups close.'], ['power-ranking-wrap', '⚡ Power ranking'], ['elo-wrap', '📈 Strength ranking'], ['dashboard-extras', '📈 Team form'], ['classics-wrap', '⚔️ League classics'], ['mvp-race-wrap', '🏆 MVP race'], ['scenario-wrap', '🏁 Playoff race'], ['ach-wrap', '🎖 New achievements']].forEach(([id, t, d]) => {
    const el = document.getElementById(id); if(!el) return;
    if(!(el.innerText || '').trim() || el.style.display === 'none' || el.dataset.euph) { el.style.display = ''; el.dataset.euph = '1'; el.innerHTML = ph(t, d); }
  });
  const lg = document.getElementById('leaders-grid'); if(lg && !(lg.innerText || '').trim()) lg.innerHTML = '<div class="card" style="padding:1rem;color:var(--muted);font-size:.86rem;border-style:dashed">No data yet — the season hasn’t started.</div>';
}

// <<KORT — silnik gry „Kort” (czysty JS, wspólny dla strony i symulacji balansu)
const KORT_CFG = {
  base: 5, scale: 2,              // siła w rzędzie = base + scale × percentyl umiejętności (płaska skala — liczy się taktyka)
  tier: { galaxy: 1, diamond: 0 }, // bonus za poziom karty
  limited: 1, form: { hot: 1, cold: -1 }, chem: 1,
  badge: { sniper: 1, scorer: 1, thief: 1, rim: .5, dime: 1, glass: 1, dd: 1, winner: 2, iron: 2 }, // odznaka: +1 (brąz/srebro) / +2 (złoto/diament) × współczynnik
  hand: 6, deck: 8, drawAfter: 1, firstBonus: 1, tacticMult: 2
};
const KORT_ROWS = ['atk', 'roz', 'obr'];
// 🎲 modyfikatory dnia: zmiana zasad na jeden mecz (ta sama dla obu stron)
const KORT_MODS = {
  threes: { icon: '🎯', pl: ['Dzień trójek', 'Snajper działa podwójnie'], en: ['Threes day', 'Sniper counts double'], cfg: { badge: { sniper: 2 } } },
  defense: { icon: '🛡️', pl: ['Defensywny dzień', 'Obrona ×2 w każdej rundzie'], en: ['Defense day', 'Defense ×2 every round'], cfg: { forceTactic: 'obr' } },
  hot: { icon: '🔥', pl: ['Gorąca ręka', 'forma liczy się podwójnie (±2)'], en: ['Hot hand', 'form counts double (±2)'], cfg: { form: { hot: 2, cold: -2 } } },
  chem: { icon: '🤝', pl: ['Dzień drużyny', 'chemia drużyny +2'], en: ['Team day', 'team chemistry +2'], cfg: { chem: 2 } },
  thief: { icon: '🦊', pl: ['Złodziejski dzień', 'Złodziej osłabia o 2'], en: ['Thieves day', 'Thief weakens by 2'], cfg: { badge: { thief: 2 } } },
  stars: { icon: '🌌', pl: ['Noc gwiazd', 'galaktyka +2, diament +1'], en: ['Night of stars', 'galaxy +2, diamond +1'], cfg: { tier: { galaxy: 2, diamond: 1 } } }
};
function kortCfg(){return __lz(8,'kortCfg',this,arguments)}
function kortModOfDay(day) { const k = Object.keys(KORT_MODS), h = [...String(day)].reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 11); return k[h % k.length]; }
function kortCard(){return __lz(8,'kortCard',this,arguments)}
function kortRng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
// 🧑‍🏫 karty trenerskie: jednorazowe akcje (najwyżej 1 w talii), darmowe — po użyciu grasz dalej w tej samej turze
const KORT_COACH = { timeout: { icon: '⏸️', pl: 'Czas na żądanie', en: 'Timeout', dpl: 'w 2. rundzie: zamień najsłabszą kartę z ręki na wierzchnią z talii (albo najlepszą z 1. rundy), jeśli jest lepsza', den: 'in round 2: swap your weakest card for the top of your deck (or your best from round 1) if it is better', row: false },
  press: { icon: '🔒', pl: 'Pressing', en: 'Full-court press', dpl: 'suma wybranego rzędu rywala −2 w 1. rundzie albo −1 w 2. rundzie', den: 'opponent’s chosen row total −2 in round 1 or −1 in round 2', row: true },
  hot: { icon: '🔥', pl: 'Gorąca ręka', en: 'Heat check', dpl: 'suma Twojego wybranego rzędu +2 w 1. rundzie albo +1 w 2. rundzie', den: 'your chosen row total +2 in round 1 or +1 in round 2', row: true } };
function kortCoach(){return __lz(8,'kortCoach',this,arguments)}
function kortNew(){return __lz(8,'kortNew',this,arguments)}
const _bv = (c, k) => (c.badges.find(b => b.key === k) || {}).b || 0;
function kortValue(){return __lz(8,'kortValue',this,arguments)}
function kortRowSum(){return __lz(8,'kortRowSum',this,arguments)}
function kortTotal(){return __lz(8,'kortTotal',this,arguments)}
function _kortStrongest(){return __lz(8,'_kortStrongest',this,arguments)}
function kortPlay(){return __lz(8,'kortPlay',this,arguments)}
function kortPass(){return __lz(8,'kortPass',this,arguments)}
function _kortNextTurn(){return __lz(8,'_kortNextTurn',this,arguments)}
function _kortEndQuarter(){return __lz(8,'_kortEndQuarter',this,arguments)}
function _kortClone(){return __lz(8,'_kortClone',this,arguments)}
function kortBotMove(){return __lz(8,'kortBotMove',this,arguments)}
// KORT>>
// ═══ 🏀 KORT — UI (mecz dnia z botem-trenerem) ═══
const _KR = { atk: ['🎯', 'Atak', 'Attack'], roz: ['🧠', 'Rozegranie', 'Playmaking'], obr: ['🛡️', 'Obrona', 'Defense'] };
const _KT = { atk: ['⚡ Szybki atak', '⚡ Fast break'], roz: ['🧠 Gra zespołowa', '🧠 Team play'], obr: ['🛡️ Gra obronna', '🛡️ Lockdown defense'] };
const _KB = { sniper: '🎯', scorer: '🏀', thief: '🦊', rim: '🚫', dime: '🪄', glass: '💪', dd: '✌️', winner: '🏆', iron: '🧱' };
let _kort = null, _kortBusy = false;
function _limMeta(k) { const id = String(k || '').startsWith('lim:') ? k.slice(4) : null; return id ? (_cards?.limited || []).find(c => String(c.id) === id) || null : null; }
function _cardScope(k) { const m = _limMeta(k); return m ? _limScope(m) : null; } // karta limitowana: statystyki z jej tygodnia albo meczu rekordowego
function _kortSrc(name, extra = {}) { // karta gracza → dane do gry (zwykła: bieżący sezon; limitowana: jej tydzień/mecz)
  const d = (extra.scope && _pcData(name, extra.scope)) || _pcData(name, 'season') || _pcData(name, 'career'); if(!d) return null;
  const A = d.sk?.attrs || {}, p = k => A[k]?.p ?? .5, f = d.sk?.form?.icon;
  const tierKey = { GALAKTYKA: 'galaxy', DIAMENT: 'diamond', 'ZŁOTO': 'gold', SREBRO: 'silver', 'BRĄZ': 'bronze' }[d.tier?.[0]] || 'bronze';
  return { name: d.name, team: d.team, rating: d.rating, tier: tierKey, lim: !!extra.lim, label: extra.label || null, form: f === '🔥' ? 'hot' : f === '❄️' ? 'cold' : '',
    attrs: { shoot: p('shoot'), three: p('three'), inside: p('inside'), play: p('play'), ball: p('ball'), def: p('def'), reb: p('reb') }, badges: (d.sk?.badges || []).map(b => ({ key: b.key, l: b.l })) };
}
function _kortLeague() { const seen = new Set(), out = []; _withAllMatches(() => matches.filter(m => (m.seasonId || null) === (currentSeasonId || null))).forEach(m => [m.team1, m.team2].forEach(t => (t.players || []).forEach(p => { const k = _normNick(p.name); if(seen.has(k)) return; seen.add(k); const s = _kortSrc(p.name); if(s) out.push(s); }))); return out; }
function _kortDayHash(s) { return [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7); }
function _kortMyDeck() { // talia: wybrane karty z kolekcji (8), brakujące — „wypożyczeni” gracze ligi
  const L = _kortLeague(), saved = (() => { try { return JSON.parse(localStorage.getItem('kort_deck') || '[]'); } catch(e) { return []; } })();
  const own = Object.entries(_cards?.cards || {}).filter(([, c]) => c.n > 0);
  let deck = saved.map(k => { const c = _cards?.cards?.[k]; return c && !k.startsWith('coach:') ? _kortSrc(c.name, { lim: k.startsWith('lim:'), label: c.label, scope: _cardScope(k) }) : null; }).filter(Boolean);
  if(deck.length < 8) own.forEach(([k, c]) => { if(deck.length < 8 && !k.startsWith('coach:') && !deck.some(x => _normNick(x.name) === _normNick(c.name))) { const s = _kortSrc(c.name, { lim: k.startsWith('lim:'), label: c.label, scope: _cardScope(k) }); if(s) deck.push(s); } });
  const rnd = kortRng(_kortDayHash((discordUser?.id || 'guest') + 'loan'));
  const pool = L.filter(x => !deck.some(d => _normNick(d.name) === _normNick(x.name))).sort((a, b) => a.rating - b.rating).slice(0, Math.max(8, Math.round(L.length * .6)));
  while(deck.length < 8 && pool.length) deck.push({ ...pool.splice(Math.floor(rnd() * pool.length), 1)[0], loan: true });
  return deck.slice(0, 8);
}
function _kortOpponent(myDeck) { // temat dnia + talia o podobnej sile (dobór do gracza)
  const day = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' }), h = _kortDayHash(day), L = _kortLeague();
  const teams = [...new Set(L.map(x => x.team))].sort(), tw = typeof _totwWeeks === 'function' ? _totwWeeks()[0] : null;
  const themes = [
    { id: 'totw', name: _g('Piątka tygodnia', 'Team of the Week'), icon: '🏆', pool: tw ? _totwData(tw).map(p => L.find(x => _normNick(x.name) === _normNick(p.name))).filter(Boolean) : [] },
    { id: 'team', name: teams[h % Math.max(1, teams.length)] || 'Liga', icon: '🧢', pool: L.filter(x => x.team === teams[h % Math.max(1, teams.length)]) },
    { id: 'gal', name: _g('Gwiazdy ligi', 'League stars'), icon: '🌌', pool: L.slice().sort((a, b) => b.rating - a.rating).slice(0, 14) },
    { id: 'def', name: _g('Mur obronny', 'The Wall'), icon: '🛡️', pool: L.slice().sort((a, b) => Math.max(b.attrs.def, b.attrs.reb) - Math.max(a.attrs.def, a.attrs.reb)).slice(0, 14) },
    { id: 'shoot', name: _g('Snajperzy', 'Sharpshooters'), icon: '🎯', pool: L.slice().sort((a, b) => b.attrs.three - a.attrs.three).slice(0, 14) }];
  const th = themes[h % themes.length], avg = myDeck.reduce((s, c) => s + (c.rating || 70), 0) / Math.max(1, myDeck.length);
  const mine = new Set(myDeck.map(c => _normNick(c.name)));
  const fill = L.filter(x => !mine.has(_normNick(x.name))).sort((a, b) => Math.abs(a.rating - avg) - Math.abs(b.rating - avg));
  const base = th.pool.filter(x => !mine.has(_normNick(x.name))).sort((a, b) => Math.abs(a.rating - avg) - Math.abs(b.rating - avg)).slice(0, 6);
  const deck = [...base]; for(const x of fill) { if(deck.length >= 8) break; if(!deck.some(d => d.name === x.name)) deck.push(x); }
  // dobór siły: średnia talii bota w granicach ±2 od talii gracza (temat dnia daje tylko „smak” talii)
  const davg = () => deck.reduce((s, c) => s + (c.rating || 70), 0) / Math.max(1, deck.length);
  for(let k = 0; k < 24 && Math.abs(davg() - avg) > 2; k++) {
    const hi = davg() > avg, i = deck.reduce((bi, c, j) => (hi ? c.rating > deck[bi].rating : c.rating < deck[bi].rating) ? j : bi, 0);
    const want = avg * deck.length - (davg() * deck.length - deck[i].rating); // ocena, która wyrównałaby średnią
    const cand = L.filter(x => !mine.has(_normNick(x.name)) && !deck.some(d => d.name === x.name) && (hi ? x.rating < deck[i].rating : x.rating > deck[i].rating)).sort((a, b) => Math.abs(a.rating - want) - Math.abs(b.rating - want))[0];
    if(!cand) break; deck[i] = cand;
  }
  return { ...th, team: th.id === 'team' ? th.name : null, deck: deck.slice(0, 8), avg: Math.round(davg()), day };
}
let _kortInfo = null;
// 🏆 TURNIEJ KORTU — panel w Korcie: zapisy, drabinka, mój mecz na żywo; admin tworzy turniej
let _ktour = null;
function _kortTourHtml(){return __lz(8,'_kortTourHtml',this,arguments)}
function kortTourAct(){return __lz(8,'kortTourAct',this,arguments)}
function kortTourPlay(){return __lz(8,'kortTourPlay',this,arguments)}
function kortTourCreateOpen(){return __lz(8,'kortTourCreateOpen',this,arguments)}
function kortTourCreate(){return __lz(8,'kortTourCreate',this,arguments)}

async function renderKort() {
  const el = document.getElementById('kort-wrap'); if(!el) return;
  if(discordUser?.session && !_cards) { try { const r = await _api('/cards/me', 'GET', null, { session: true }); if(r.ok) _cards = r; } catch(e) {} }
  if(!window._leagueLoaded && !(typeof matches !== 'undefined' && matches.length)) { el.innerHTML = `<div class="card" style="padding:1rem;color:var(--muted)">⏳ ${_g('Wczytuję dane ligi…', 'Loading league data…')}</div>`; return; } // po wczytaniu danych Kort narysuje się ponownie
  const qh = (await _kortTourHtml()) + await _kortQuestsHtml();
  if(_kortTab === 'ranked') { el.innerHTML = qh + _kortTabsHtml() + _kortTopHtml() + await _kortRankedHtml() + '<div id="kort-board" style="margin-top:1rem"></div>'; return; }
  if(_kortTab === 'boss') { el.innerHTML = qh + _kortTabsHtml() + _kortTopHtml() + await _kortBossHtml() + '<div id="kort-board" style="margin-top:1rem"></div>'; return; }
  if(_kortTab === 'stats') { _kortLiveStop(); el.innerHTML = _kortTabsHtml() + await _kortStatsHtml(); return; }
  if(_kortTab === 'live') { el.innerHTML = (await _kortTourHtml()) + _kortTabsHtml() + await _kortLiveHtml() + '<div id="kort-board" style="margin-top:1rem"></div>'; return; }
  if(_kortTab === 'draft') { el.innerHTML = _kortTabsHtml() + await _kortDraftHtml() + '<div id="kort-board" style="margin-top:1rem"></div>'; return; }
  _kortLiveStop();
  const deck = _kortMyDeck(), opp = _kortOpponent(deck);
  if(deck.length < 8 || opp.deck.length < 8) { el.innerHTML = _kortTabsHtml() + `<div class="card" style="padding:1rem;color:var(--muted)">${_g('Mecz dnia ruszy, gdy w sezonie zagra co najmniej 16 graczy. Pozostałe tryby (Draft, Z kolegą) działają już teraz.', 'The match of the day starts once at least 16 players have played this season. Other modes (Draft, With a friend) work already.')}</div>`; return; }
  _kortInfo = await _api('/kort', 'GET', null, discordUser?.session ? { session: true } : {}).catch(() => null);
  const me = _kortInfo?.me, today = me?.today, avg = Math.round(deck.reduce((s, c) => s + c.rating, 0) / 8), loans = deck.filter(c => c.loan).length;
  el.innerHTML = qh + _kortTabsHtml() + _kortTopHtml() + `<div data-notr>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.8rem;margin-bottom:1rem">
      <div class="card" style="padding:.9rem 1rem;background:linear-gradient(135deg,rgba(245,197,24,.12),rgba(239,68,68,.08))">
        <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--accent)">⚔️ ${_g('MECZ DNIA', 'MATCH OF THE DAY')}</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem;line-height:1.1;margin:.2rem 0">${opp.icon} ${_h(opp.name)}</div>
        <div style="font-size:.8rem;color:var(--muted)">${_g('Bot-trener · średnia talii', 'Coach bot · deck average')} ${opp.avg} · ${_g('Twoja', 'yours')} ${avg}</div>
        <div style="margin-top:.6rem;display:flex;gap:.4rem;flex-wrap:wrap"><button class="btn btn-primary" onclick="kortStart()">🏀 ${today ? _g('Zagraj jeszcze raz', 'Play again') : _g('Graj mecz dnia', 'Play the match of the day')}</button>
          ${discordUser ? `<button class="btn btn-ghost" onclick="kortDeckPick()">🃏 ${_g('Ułóż talię', 'Build deck')}</button>` : ''}</div>
        ${me ? (() => { const w = me.weekWins || 0, k = w % 3; return `<div style="margin-top:.55rem;font-size:.78rem">🎁 ${_g('Do paczki w tym tygodniu', 'Towards a pack this week')}: <b>${k}/3</b> ${_g('dni z wygraną', 'winning days')}<div style="height:6px;background:var(--surface2);border-radius:3px;margin-top:.25rem;overflow:hidden"><div style="height:100%;width:${k / 3 * 100}%;background:var(--accent)"></div></div>${w >= 3 ? `<div style="font-size:.68rem;color:var(--muted);margin-top:.15rem">${_g('Paczki zdobyte w tym tygodniu', 'Packs earned this week')}: ${Math.floor(w / 3)}</div>` : ''}</div>`; })() : ''}
        <div style="font-size:.74rem;margin-top:.45rem;color:var(--muted)">${today ? (today.r === 'win' ? '✅ ' + _g('Pierwszy mecz dnia wygrany', 'First match of the day won') : today.r === 'draw' ? '🤝 ' + _g('Pierwszy mecz dnia: remis', 'First match of the day: draw') : '❌ ' + _g('Pierwszy mecz dnia przegrany', 'First match of the day lost')) + ' · ' + _g(`XP odebrane (+${today.xp || 0})`, `XP claimed (+${today.xp || 0})`) + ' · ' + (me?.winToday ? _g('dzień z wygraną zaliczony do paczki ✅', 'winning day counted for the pack ✅') : _g('wygraj dziś mecz, by zaliczyć dzień do paczki', 'win a match today to count it towards a pack')) : discordUser ? _g('XP za pierwszy mecz dnia: wygrana +20 · remis +10 · porażka +5 · 🎁 paczka co 3 dni z wygraną w tygodniu (liczy się pierwsza wygrana dnia, w dowolnym meczu)', 'XP for the first match of the day: win +20 · draw +10 · loss +5 · 🎁 a pack for every 3 winning days a week (your first win of the day counts, in any match)') : _g('Zaloguj się, żeby zdobywać nagrody.', 'Log in to earn rewards.')}</div></div>
      <div class="card" style="padding:.9rem 1rem"><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">🃏 ${_g('TWOJA TALIA', 'YOUR DECK')} · ${_g('średnia', 'avg')} ${avg}</div>
        <div style="display:flex;flex-wrap:wrap;gap:.3rem">${deck.map(c => `<span style="font-size:.72rem;background:var(--surface2);border:1px solid ${c.lim ? '#f5c518' : 'var(--border)'};border-radius:6px;padding:.15rem .4rem">${c.lim ? '🌟 ' : ''}${_h(c.name)} <b>${c.rating}</b>${c.loan ? ' <span style="color:var(--muted)">(' + _g('wyp.', 'loan') + ')</span>' : ''}</span>`).join('')}</div>
        ${loans ? `<div style="font-size:.7rem;color:var(--muted);margin-top:.4rem">${_g(`${loans} ${_plPL(loans, 'karta wypożyczona', 'karty wypożyczone', 'kart wypożyczonych')} — zbieraj karty, żeby grać swoimi.`, `${loans} loaned cards — collect cards to play with your own.`)}</div>` : ''}</div>
      <div class="card" style="padding:.9rem 1rem"><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">🏆 ${_g('RANKING', 'RANKING')}${me ? ` · ${_g('Ty', 'You')}: ${me.w}-${me.l}${me.d ? '-' + me.d : ''}${me.streak > 1 ? ' · 🔥' + me.streak : ''}` : ''}</div>
        ${(_kortInfo?.board || []).slice(0, 8).map((x, i) => `<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:.15rem 0;border-bottom:1px solid var(--border)"><span>${['🥇', '🥈', '🥉'][i] || (i + 1) + '.'} ${_h(x.name)}</span><b>${x.w}-${x.l}</b></div>`).join('') || `<div style="font-size:.8rem;color:var(--muted)">${_g('Jeszcze nikt nie grał — bądź pierwszy!', 'Nobody has played yet — be the first!')}</div>`}</div></div>
    <div id="kort-board"></div>
    <details class="card" style="padding:.7rem .9rem;margin-top:1rem"><summary style="cursor:pointer;font-weight:800">📖 ${_g('Jak grać', 'How to play')}</summary><div style="font-size:.84rem;line-height:1.6;margin-top:.5rem">${_g(
      `<b>Mecz = do 2 wygranych rund (maks. 3).</b> W swojej turze zagrywasz jedną kartę do jednego z rzędów albo <b>pasujesz</b> (wtedy nie zagrasz już nic w tej rundzie — rywal może dalej dokładać). Runda kończy się, gdy obaj spasują; wygrywa wyższa suma.<br>
      <b>Rzędy:</b> 🎯 Atak (rzut, za 3, pod koszem), 🧠 Rozegranie (rozgrywanie, prowadzenie piłki), 🛡️ Obrona (obrona, zbiórki) — siła karty w rzędzie zależy od umiejętności gracza w lidze.<br>
      <b>Taktyka rundy:</b> w każdej rundzie jeden rząd liczy się <b>podwójnie</b>.<br>
      <b>Karty:</b> zaczynasz z 6 kartami (zaczynający 7), po każdej rundzie dobierasz 1 — oszczędzaj silne karty na ważne rundy!<br>
      <b>Bonusy:</b> 🌌 galaktyka +1, 🌟 karta limitowana +1 i odporna, 🔥 forma +1 (❄️ −1), dwóch graczy z tej samej drużyny na boisku: +1 każdy.<br>
      <b>Odznaki:</b> 🎯 Snajper +1/+2 w Ataku · 🏀 Punktowa maszyna +1/+2 w Ataku obok drugiego atakującego · 💪 Zbiórki +1/+2 w Obronie · 🪄 Kreator +1/+2 w Rozegraniu obok drugiego rozgrywającego · ✌️ Double-double +1 (złoto/diament) · 🏆 Zwycięzca +2/+4 w 3. rundzie · 🦊 Złodziej w Rozegraniu: −1 najsilniejszemu rozgrywającemu rywala · 🚫 Obrońca obręczy w Obronie: −1 najsilniejszej karcie rywala · 🧱 Żelazny: odporny, +2 w 3. rundzie.`,
      `<b>A match = first to win 2 rounds (max. 3).</b> On your turn play one card into a row or <b>pass</b> (you can\\u2019t play more this round — your opponent can keep going). The round ends when both pass; higher total wins.<br>
      <b>Rows:</b> 🎯 Attack (shooting, threes, inside), 🧠 Playmaking (passing, ball handling), 🛡️ Defense (defense, rebounds) — a card\\u2019s power depends on the player\\u2019s league skills.<br>
      <b>Round tactic:</b> one row counts <b>double</b> each round.<br>
      <b>Cards:</b> you start with 6 (the starter 7) and draw 1 after each round — save strong cards for key rounds!<br>
      <b>Bonuses:</b> 🌌 galaxy +1, 🌟 limited card +1 and immune, 🔥 form +1 (❄️ −1), two teammates on court: +1 each.<br>
      <b>Badges:</b> 🎯 Sniper +1/+2 in Attack · 🏀 Bucket getter +1/+2 in Attack next to another attacker · 💪 Glass +1/+2 in Defense · 🪄 Dimer +1/+2 in Playmaking next to another playmaker · ✌️ Double-double +1 (gold/diamond) · 🏆 Winner +2/+4 in round 3 · 🦊 Thief in Playmaking: −1 to the opponent\\u2019s best playmaker · 🚫 Rim protector in Defense: −1 to the opponent\\u2019s best card · 🧱 Iron: immune, +2 in round 3.`)}</div></details></div>`;
}
function _kortPickInfo(){return __lz(8,'_kortPickInfo',this,arguments)}
// ═══ 🃏 KORT 2.0 — tryby (mecz dnia / ranking z kibicami / boss tygodnia), udostępnianie wyniku, podpowiedzi ═══
var _kortTab = window._kortTab || 'daily', _kortLadder = null, _kortBossInfo = null, _kortOppPick = null;
const _KDIV = { galaxy: ['🌌', 'Galaktyka', 'Galaxy', '#a855f7'], diamond: ['💎', 'Diament', 'Diamond', '#38bdf8'], gold: ['🥇', 'Złoto', 'Gold', '#f5c518'], silver: ['🥈', 'Srebro', 'Silver', '#cbd5e1'], bronze: ['🥉', 'Brąz', 'Bronze', '#d08b4f'] };
const _kDiv = d => { const x = _KDIV[d] || _KDIV.bronze; return `<span style="color:${x[3]};font-weight:800">${x[0]} ${currentLang === 'en' ? x[2] : x[1]}</span>`; };
function _kortModToday() { return kortModOfDay(new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' })); }
function _kortModHtml(compact) { const k = _kortModToday(), m = KORT_MODS[k]; if(!m) return ''; const [t, d] = currentLang === 'en' ? m.en : m.pl;
  return compact ? `<span class="kc-mod">${m.icon} ${t}</span>` : `<div class="kc-modbar">🎲 ${_g('Modyfikator dnia', 'Modifier of the day')}: <b>${m.icon} ${t}</b> — ${d}<span style="color:var(--muted)"> · ${_g('obowiązuje dziś we wszystkich meczach', 'applies to all matches today')}</span></div>`; }
function _kortTopHtml() { return (_kortTab === 'daily' || _kortTab === 'ranked' || _kortTab === 'boss') ? _coachPickerHtml() : ''; }
function _kortTabsHtml() {
  const t = (k, l) => `<button onclick="_kortTab='${k}';renderKort()" class="btn ${_kortTab === k ? 'btn-primary' : 'btn-ghost'}" style="font-size:.8rem">${l}</button>`;
  return _kortModHtml() + `<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.9rem">${t('daily', '⚔️ ' + _g('Mecz dnia', 'Match of the day'))}${t('ranked', '🏆 ' + _g('Ranking', 'Ranked'))}${t('boss', '👑 ' + _g('Boss tygodnia', 'Weekly boss'))}${t('draft', '🎴 Draft')}${t('live', '🤝 ' + _g('Z kolegą', 'With a friend'))}${t('stats', '📈 ' + _g('Statystyki', 'Stats'))}</div>`;
}
function _kortOwnDeck(){return __lz(8,'_kortOwnDeck',this,arguments)}
function _kortSaveDeckServer(){return __lz(8,'_kortSaveDeckServer',this,arguments)}
function _kortRankedHtml(){return __lz(8,'_kortRankedHtml',this,arguments)}
function kortFindOpp(){return __lz(8,'kortFindOpp',this,arguments)}
function _kortBossDeck(){return __lz(8,'_kortBossDeck',this,arguments)}
function _kortBossHtml(){return __lz(8,'_kortBossHtml',this,arguments)}
function _kortShareImage(){return __lz(8,'_kortShareImage',this,arguments)}
function kortShare(){return __lz(8,'kortShare',this,arguments)}
function kortShareSend(){return __lz(8,'kortShareSend',this,arguments)}
function _kortTip(){return __lz(8,'_kortTip',this,arguments)}

// ═══ 🃏 KORT — emocje (komentarz, animacja rundy, dźwięki), moje statystyki, balans (admin) ═══
const _KC_BADGE_NAME = { sniper: ['Snajper', 'Sniper'], scorer: ['Punktowa maszyna', 'Bucket getter'], thief: ['Złodziej', 'Thief'], rim: ['Obrońca obręczy', 'Rim protector'], dime: ['Kreator', 'Dimer'], glass: ['Zbiórki', 'Glass'], dd: ['Double-double', 'Double-double'], winner: ['Zwycięzca', 'Winner'], iron: ['Żelazny', 'Iron'] };
const _kbName = k => (_KC_BADGE_NAME[k] || [k, k])[currentLang === 'en' ? 1 : 0];
function _kortComment(){return __lz(8,'_kortComment',this,arguments)}
// 🔊 dźwięki (syntezator w przeglądarce, bez plików)
let _kAudio = null;
function _kSfx(){return __lz(8,'_kSfx',this,arguments)}
function _kortFx(){return __lz(8,'_kortFx',this,arguments)}
function _kortStatsHtml(){return __lz(8,'_kortStatsHtml',this,arguments)}
function openEloRecalc(){return __lz(8,'openEloRecalc',this,arguments)}

function openKortBalance(){return __lz(8,'openKortBalance',this,arguments)}

function _kortCourt(){return __lz(8,'_kortCourt',this,arguments)}
const _kortBack = (w = 34) => `<div class="kc-back" style="width:${w}px;height:${Math.round(w * 1.3)}px"><span>🏀</span></div>`;
const _KBROW = { sniper: 'atk', scorer: 'atk', glass: 'obr', rim: 'obr', dime: 'roz', thief: 'roz', dd: '*', winner: 'q3', iron: 'q3' };
function _kortFxFor(){return __lz(8,'_kortFxFor',this,arguments)}
function _kortCelebrate(){return __lz(8,'_kortCelebrate',this,arguments)}
function _kortMvpCard(){return __lz(8,'_kortMvpCard',this,arguments)}
function _kortBindDrag(){return __lz(8,'_kortBindDrag',this,arguments)}

// ═══ 🤝 KORT NA ŻYWO — wyzwanie z linkiem, gra tura po turze przez serwer ═══
var _kortLiveCode = window._kortLiveCode || null, _kortLivePoll = null; // var: ustawiane przez link /duel-… zanim skrypt dojdzie do tej linii
setInterval(() => { const t = document.querySelector('.kc-timer'); if(t && _kort?.live) t.textContent = '⏱ ' + Math.max(0, Math.ceil((_kort.live.turnLeft - (Date.now() - _kort.live.at)) / 1000)) + 's'; }, 1000);
function _kortLiveStop(){return __lz(8,'_kortLiveStop',this,arguments)}
function _kortLiveHtml(){return __lz(8,'_kortLiveHtml',this,arguments)}
function kortLiveNew(){return __lz(8,'kortLiveNew',this,arguments)}
function kortLiveCancel(){return __lz(8,'kortLiveCancel',this,arguments)}
function kortLiveJoin(){return __lz(8,'kortLiveJoin',this,arguments)}
function kortLiveStart(){return __lz(8,'kortLiveStart',this,arguments)}
function _kortLiveTick(){return __lz(8,'_kortLiveTick',this,arguments)}
function _kortLiveMove(){return __lz(8,'_kortLiveMove',this,arguments)}

function kortStartServer(){return __lz(8,'kortStartServer',this,arguments)}
function _kortDraftEndHtml(){return __lz(8,'_kortDraftEndHtml',this,arguments)}
function _kortServerEnd(){return __lz(8,'_kortServerEnd',this,arguments)}
const _kortRewardTxt = rw => !rw ? '' : ' · ' + [rw.xp ? `+${rw.xp} XP` : '', rw.bonus ? `🎁×${rw.bonus}` : '', rw.premium ? `💎×${rw.premium}` : ''].filter(Boolean).join(' ');
// 🎴 DRAFT: wybór 8 kart z trójek, seria do 3 porażek albo 7 wygranych
let _kortDraftRun = null, _kortDraftInfo = null;
function _kortDraftHtml(){return __lz(8,'_kortDraftHtml',this,arguments)}
function kortDraftNew(){return __lz(8,'kortDraftNew',this,arguments)}
function kortDraftPick(){return __lz(8,'kortDraftPick',this,arguments)}

// ═══ 🧑‍🏫 KARTY TRENERSKIE (kolekcja, wybór przed meczem, użycie na boisku) + 🎯 WYZWANIA KORTU ═══
const _coachName = t => { const c = KORT_COACH[t]; return c ? `${c.icon} ${currentLang === 'en' ? c.en : c.pl}` : ''; };
const _coachDesc = t => { const c = KORT_COACH[t]; return c ? (currentLang === 'en' ? c.den : c.dpl) : ''; };
function _coachOwned() { return Object.entries(_cards?.cards || {}).filter(([k, c]) => k.startsWith('coach:') && c.n > 0).map(([k, c]) => ({ t: k.slice(6), n: c.n })).filter(x => KORT_COACH[x.t]); }
function _coachSel() { const t = localStorage.getItem('kort_coach') || ''; return _coachOwned().some(x => x.t === t) ? t : null; }
function _coachPickerHtml() {
  const own = _coachOwned(); if(!discordUser) return '';
  return `<div class="card" style="padding:.7rem .9rem;margin-bottom:.8rem;display:flex;gap:.6rem;align-items:center;flex-wrap:wrap" data-notr>
    <b style="font-size:.84rem">🧑‍🏫 ${_g('Karta trenerska', 'Coach card')}:</b>
    ${own.length ? `<select onchange="localStorage.setItem('kort_coach', this.value); _kortCoachSync(); renderKort()" style="font-size:.8rem;padding:.25rem .4rem;border-radius:7px;border:1px solid var(--border);background:var(--surface2);color:var(--text)"><option value="">${_g('— bez karty —', '— none —')}</option>${own.map(x => `<option value="${x.t}" ${_coachSel() === x.t ? 'selected' : ''}>${_coachName(x.t)} ×${x.n}</option>`).join('')}</select>
      <span style="font-size:.74rem;color:var(--muted);flex:1;min-width:200px">${_coachSel() ? _coachDesc(_coachSel()) + ' · ' + _g('darmowa akcja, raz na mecz', 'free action, once per match') : _g('Wybierz kartę, by użyć jej w meczu (jedna na mecz, darmowa akcja).', 'Pick a card to use in a match (one per match, free action).')}</span>`
      : `<span style="font-size:.76rem;color:var(--muted)">${_g('Nie masz jeszcze kart trenerskich — wypadają rzadko z paczek (z premium częściej).', 'No coach cards yet — they drop rarely from packs (more often from premium).')}</span>`}</div>`;
}
function _kortCoachSync(){return __lz(8,'_kortCoachSync',this,arguments)} function _coachBenchHtml(){return __lz(8,'_coachBenchHtml',this,arguments)}
function kortHumanCoach(){return __lz(8,'kortHumanCoach',this,arguments)} // darmowa akcja — tura zostaje
// 🎯 wyzwania Kortu
let _kortQuests = null;
function _kortQuestsHtml(){return __lz(8,'_kortQuestsHtml',this,arguments)}
function _kortLogExtras(){return __lz(8,'_kortLogExtras',this,arguments)}

function kortDeckPick(){return __lz(8,'kortDeckPick',this,arguments)}
function kortStart(){return __lz(8,'kortStart',this,arguments)}
function _kortCardHtml(){return __lz(8,'_kortCardHtml',this,arguments)}
function _kortDraw(){return __lz(8,'_kortDraw',this,arguments)}
function _kortEndHtml(){return __lz(8,'_kortEndHtml',this,arguments)}
function kortHumanPlay(){return __lz(8,'kortHumanPlay',this,arguments)}
function kortHumanPass(){return __lz(8,'kortHumanPass',this,arguments)}
function _kortBot(){return __lz(8,'_kortBot',this,arguments)}

function goToTeamRegistrations(){return __lz(8,'goToTeamRegistrations',this,arguments)}
function _moveJoinSection() { const el = document.getElementById('team-registrations-wrap'), host = document.getElementById('join-wrap'); if(el && host && el.parentElement !== host) host.appendChild(el); }

function closeTeamRegModal(){return __lz(8,'closeTeamRegModal',this,arguments)}

function openTeamRegModal(){return __lz(8,'openTeamRegModal',this,arguments)}

function teamRegLogoChange(){return __lz(8,'teamRegLogoChange',this,arguments)}


function teamRegAddPlayer(){return __lz(8,'teamRegAddPlayer',this,arguments)}

function teamRegUpdateCount(){return __lz(8,'teamRegUpdateCount',this,arguments)}

const _EXP_PL = { beginner:'🌱 Początkujący', intermediate:'⚡ Średnio-zaawansowany', advanced:'🔥 Zaawansowany', pro:'👑 Pro / Weteran' }, _EXP_EN = { beginner:'🌱 Beginner', intermediate:'⚡ Intermediate', advanced:'🔥 Advanced', pro:'👑 Pro / Veteran' };
const _expLabels = {}; // etykiety poziomu w języku strony (zwykły obiekt — działa w każdej przeglądarce)
function _syncExpLabels() { Object.assign(_expLabels, currentLang === 'en' ? _EXP_EN : _EXP_PL); }
_syncExpLabels();
function _faLevel(x) { return _expLabels[x] || (typeof TEAM_LEVELS !== 'undefined' && (TEAM_LEVELS.includes(x) || FA_EU_LEVELS.includes(x)) ? '📶 ' + x : ''); } function submitTeamRegistration(){return __lz(8,'submitTeamRegistration',this,arguments)}

function renderTeamRegistrations() {
  const wrap = document.getElementById('team-registrations-wrap');
  if(!wrap) return;

  // Group by season
  const grouped = {};
  teamRegistrations.forEach(r => {
    const key = r.seasonId || '__none__';
    if(!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  const statusBadge = s => {
    if(s==='approved') return '<span style="background:#16a34a;color:#fff;border-radius:4px;padding:.1rem .4rem;font-size:.65rem;font-weight:700">✅ ZATWIERDZONA</span>';
    if(s==='rejected') return '<span style="background:#dc2626;color:#fff;border-radius:4px;padding:.1rem .4rem;font-size:.65rem;font-weight:700">❌ ODRZUCONA</span>';
    return '<span style="background:var(--accent);color:rgba(0,0,0,.8);border-radius:4px;padding:.1rem .4rem;font-size:.65rem;font-weight:700">⏳ OCZEKUJE</span>';
  };

  const isAdmin = _isLoggedInSync();
  const isMyTeam = r => discordUser && r.captain?.id === discordUser.id;

  const _stOrder = { pending: 0, approved: 1, rejected: 2 };
  const pendingCount = teamRegistrations.filter(r => r.status === 'pending').length;
  const badge = document.getElementById('team-reg-admin-badge');
  if(badge) { badge.textContent = pendingCount; badge.style.display = pendingCount ? 'inline' : 'none'; }
  if(_regTab === 'fa') { renderFreeAgents(wrap); return; }
  if(_regTab === 'tr') { renderTransfers(wrap); return; }
  const cards = [...teamRegistrations]
    .filter(r => r.status !== 'rejected' || isAdmin || isMyTeam(r))
    .sort((a,b) => isAdmin ? (_stOrder[a.status]??9) - (_stOrder[b.status]??9) : 0)
    .map(r => {
      const sName = r.seasonId ? (seasons.find(s=>s.id===r.seasonId)?.name||r.seasonId) : '';
      const logoHtml = r.logo
        ? `<img src="${r.logo}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;border:1px solid var(--border)">`
        : `<div style="width:48px;height:48px;border-radius:8px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:1.4rem">🏀</div>`;
      const btn = (st, label, color) => `<button onclick="teamRegSetStatus('${r.id}','${st}')" class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .5rem;color:${color}">${label}</button>`;
      const payBtns = (isMyTeam(r) || isAdmin) && r.status !== 'rejected' && (EU_MODE || _signup().revolutUrl || r.payment) ? `<div style="display:flex;gap:.35rem;align-items:center;margin-top:.5rem;flex-wrap:wrap">${_levelBadge(r)}${_payBadge(r)}
        ${isMyTeam(r) && r.payment?.status !== 'paid' ? `<button class="btn btn-primary" style="font-size:.72rem;padding:.2rem .55rem" onclick="openTeamPayment('${r.id}')">💶 ${_g('Wpisowe', 'Entry fee')}</button>` : ''}
        ${isAdmin && ['sent', 'paid'].includes(r.payment?.status) ? `<button class="btn btn-primary" style="font-size:.72rem;padding:.2rem .55rem" onclick="openPayments();setTimeout(()=>payProof('${r.id}'),150)">🧾 Zobacz przelew</button>` : ''}
        ${isAdmin && r.payment?.status === 'sent' ? `<button class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .55rem" onclick="payConfirm('${r.id}',true)">✅ Opłacone</button>` : ''}
        ${isAdmin ? `<button class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .55rem" onclick="openPayments()">💳 Płatności</button>` : ''}</div>` : '';
      const adminBtns = payBtns + (isAdmin ? `
        <div style="display:flex;gap:.35rem;margin-top:.6rem;flex-wrap:wrap">
          ${r.status !== 'approved' ? btn('approved','✅ Zatwierdź','var(--win)') : ''}
          ${r.status !== 'rejected' ? btn('rejected','❌ Odrzuć','var(--loss)') : ''}
          ${r.status !== 'pending'  ? btn('pending','↩ Cofnij do oczekujących','var(--muted)') : ''}
          <button onclick="openRosterEditor('${r.id}')" class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .5rem;color:var(--muted)">✏️ Edytuj skład</button>
          <button onclick="openCaptainChange('${r.id}')" class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .5rem;color:var(--muted)">👤 Zmień kapitana</button>
          ${r.status !== 'rejected' ? `<button onclick="teamRegAnnounceBtn('${r.id}')" class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .5rem;color:var(--accent)" title="${r.status === 'approved' ? 'Kanał: Zatwierdzenie drużyny' : 'Kanał: Nowe zgłoszenie drużyny'}">📣 Ogłoś na Discordzie</button>` : ''}
          <button onclick="teamRegDelete('${r.id}')" class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .5rem;color:var(--muted)">🗑 Usuń</button>
        </div>` : '');
      const rejectNote = (isAdmin || isMyTeam(r)) && r.status === 'rejected' && r.rejectReason
        ? `<div style="font-size:.75rem;color:var(--loss);margin-top:.4rem">Powód: ${r.rejectReason}</div>` : '';
      const playerPills = (r.players||[]).map(p =>
        `<span style="display:inline-flex;align-items:center;gap:.25rem;background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:.15rem .45rem;font-size:.75rem;white-space:nowrap">
          <span style="font-size:.65rem;color:var(--muted)">${p.platform==='xbox'?'🎮':'🎯'}</span>
          <span>${p.gamertag}</span>
          ${p.experience ? `<span style="font-size:.62rem;color:var(--muted)">${_expLabels[p.experience]?.split(' ')[0]||''}</span>` : ''}
        </span>`
      ).join('');
      return `
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1rem 1.25rem;margin-bottom:.75rem">
          <div style="display:flex;align-items:flex-start;gap:.85rem">
            ${logoHtml}
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.25rem">
                <span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.05rem;letter-spacing:.5px">${r.teamName}</span>
                ${statusBadge(r.status)}
                ${sName ? `<span style="font-size:.72rem;color:var(--accent);font-weight:700">${sName}</span>` : ''}
              </div>
              <div style="font-size:.75rem;color:var(--muted);margin-bottom:.5rem">
                👤 Kapitan: <b style="color:var(--text)">${r.captain?.name||'?'}</b>
                · ${r.players?.length||0} graczy
                · ${new Date(r.registeredAt).toLocaleDateString('pl-PL')}
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:.3rem">${playerPills}</div>
              ${rejectNote}
              ${_rosterBlock(r)}
              ${adminBtns}
            </div>
          </div>
        </div>`;
    }).join('');

  wrap.innerHTML = _regTabsHtml(`
        ${isAdmin ? `<button onclick="openTeamRegWebhookModal()" class="btn btn-ghost" style="font-size:.78rem;padding:.35rem .7rem" title="Kanał Discord dla zgłoszeń">⚙ Kanał Discord${discordTeamRegWebhookUrl ? '' : ' <span style="color:var(--loss)">●</span>'}</button>` : ''}
        ${isAdmin ? `<button onclick="toggleRegistrations()" class="btn btn-ghost" style="font-size:.78rem;padding:.35rem .7rem">${registrationsClosed ? '🔓 Otwórz zapisy' : '🔒 Zamknij zapisy'}</button>` : ''}
        ${registrationsClosed
          ? `<span style="font-size:.78rem;font-weight:700;color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:.35rem .75rem">🔒 Zapisy zamknięte</span>`
          : `<button onclick="openTeamRegModal()" class="btn btn-primary" style="font-size:.82rem;padding:.35rem .85rem">+ Zgłoś drużynę</button>`}`) + `
    ${cards || `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:2rem;text-align:center;color:var(--muted)">
      <div style="font-size:2rem;margin-bottom:.5rem">🏀</div>
      <div style="font-size:.9rem;font-weight:600;margin-bottom:.35rem">Brak zgłoszonych drużyn</div>
      <div style="font-size:.8rem">Bądź pierwszy — zgłoś swoją drużynę do sezonu NBA 2K27!</div>
    </div>`}
  `;
}

function teamRegSetStatus(){return __lz(8,'teamRegSetStatus',this,arguments)}

function teamRegAnnounce(){return __lz(8,'teamRegAnnounce',this,arguments)}
function teamRegAnnounceBtn(){return __lz(8,'teamRegAnnounceBtn',this,arguments)}

function teamRegDelete(){return __lz(8,'teamRegDelete',this,arguments)}

function renderDiscordQueue(){return __lz(8,'renderDiscordQueue',this,arguments)}

function loadDiscordScreenshot(){return __lz(8,'loadDiscordScreenshot',this,arguments)}

function dismissDiscordScreenshot(){return __lz(8,'dismissDiscordScreenshot',this,arguments)}

function refreshDiscordQueue(){return __lz(8,'refreshDiscordQueue',this,arguments)}

function loadDiscordQueueFromWorker(){return __lz(8,'loadDiscordQueueFromWorker',this,arguments)}

// Called from _doShowView when switching to add-match
function initDiscordQueue() {
  if(workerUrl && _isLoggedInSync()) {
    loadDiscordQueueFromWorker().then(() => renderDiscordQueue());
  } else {
    renderDiscordQueue();
  }
}

// Public API endpoint for n8n webhook to add screenshots
// n8n calls: PUT to JSONBin with pendingScreenshots array updated
// We expose a helper to understand the expected format:
/*
  Expected pendingScreenshots item from n8n:
  {
    id: "discord_msg_id",
    url: "https://cdn.discordapp.com/attachments/.../screenshot.png",
    author: "KapitanDruzyny",
    authorId: "discord_user_id",
    channelId: "channel_id",
    channelName: "screeny-meczow",
    timestamp: "2026-03-15T20:00:00.000Z",
    processed: false
  }
*/


// ═══════════════════════════════════════════════════════════════
// EVENTS SYSTEM
// ═══════════════════════════════════════════════════════════════

const EVENT_TYPES = {
  draft:    { label: '🎯 Draft', desc: 'Kapitanowie wybierają graczy po kolei' },
  team:     { label: '🏀 Turniej drużynowy', desc: 'Gotowe składy rywalizują w turnieju' },
  onevsone: { label: '⚡ Turniej 1v1', desc: 'Każdy gra sam' },
  pickup:   { label: '🎲 Pickup Game', desc: 'Losowe przydzielenie do drużyn' },
};

function getEventStatus() {
  const en = currentLang === 'en';
  return {
    open:     { label: en ? '✅ Sign-ups open'   : '✅ Zapisy otwarte',    color: 'var(--win)' },
    closed:   { label: en ? '🔒 Sign-ups closed' : '🔒 Zapisy zamknięte', color: 'var(--muted)' },
    draft:    { label: en ? '🎯 Draft in progress': '🎯 Trwa draft',       color: '#f39c12' },
    active:   { label: en ? '🏀 In progress'      : '🏀 W toku',          color: '#3498db' },
    finished: { label: en ? '🏆 Finished'         : '🏆 Zakończony',      color: 'var(--accent)' },
  };
}
// Keep backward compat
const EVENT_STATUS = new Proxy({}, { get: (_, k) => getEventStatus()[k] });

function renderEventsDashboard() {
  const wrap = document.getElementById('events-dashboard-wrap');
  if(!wrap) return;
  const activeStatuses = ['open', 'closed', 'draft', 'active'];
  const activeEvents = (events || []).filter(ev => activeStatuses.includes(ev.status));
  if(!activeEvents.length) { wrap.innerHTML = ''; return; }
  const sorted = [...activeEvents].sort((a, b) => {
    const order = { active: 0, open: 1, draft: 2, closed: 3 };
    const oa = order[a.status] ?? 9, ob = order[b.status] ?? 9;
    if(oa !== ob) return oa - ob;
    return new Date(a.date||'9999') - new Date(b.date||'9999');
  });
  wrap.innerHTML = `
    <div style="margin-bottom:1.5rem">
      <div class="section-title" style="margin-bottom:.75rem">🏆 Aktywne Eventy</div>
      ${sorted.map(ev => {
        const type = EVENT_TYPES[ev.type] || { label: ev.type };
        const status = EVENT_STATUS[ev.status] || { label: ev.status, color: 'var(--muted)' };
        const playerCount = (ev.players||[]).length;
        const isSignedUp = discordUser && (ev.players||[]).some(p => p.id === discordUser.id);
        return `<div class="card" style="padding:1rem 1.25rem;margin-bottom:.75rem;cursor:pointer;border-left:3px solid ${status.color}" onclick="openEventDetail('${ev.id}')">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap">
            <div style="flex:1;min-width:0">
              <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.15rem;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ev.title}</div>
              <div style="font-size:.8rem;color:var(--muted);margin-top:.2rem">${type.label}${ev.date ? ' · ' + ev.date : ''}${ev.time ? ' · <b style="color:var(--text)">' + ev.time + '</b>' : ''}</div>
            </div>
            <div style="display:flex;align-items:center;gap:.75rem;flex-shrink:0">
              ${isSignedUp ? '<span style="font-size:.75rem;color:var(--win);font-weight:700">✅ Zapisany</span>' : ''}
              <div style="text-align:right">
                <div style="font-weight:700;font-size:.82rem;color:${status.color}">${status.label}</div>
                <div style="font-size:.78rem;color:var(--muted)">👥 ${playerCount}${ev.maxPlayers?'/'+ev.maxPlayers:''}</div>
              </div>
              <span style="color:var(--muted);font-size:1rem">›</span>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function renderEvents() {
  const el = document.getElementById('events-list');
  if(!el) return;
  renderEventsDashboard();
  const btnNew = document.getElementById('events-admin-btns');
  if(btnNew) btnNew.style.display = _isEventsAdminSync() ? 'flex' : 'none';
  if(!events.length) {
    el.innerHTML = _isEventsAdminSync()
      ? '<div class="empty"><div class="icon">🏆</div><p>Brak eventów — kliknij &quot;+ Nowy Event&quot; aby stworzyć pierwszy.</p></div>'
      : '<div class="empty"><div class="icon">🏆</div><p>Brak eventów.</p></div>';
    return;
  }
    el.innerHTML = [...events].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0)).map(ev => {
    const type = EVENT_TYPES[ev.type] || { label: ev.type };
    const status = EVENT_STATUS[ev.status] || { label: ev.status, color: 'var(--muted)' };
    const playerCount = (ev.players||[]).length;
    return `<div class="card" style="padding:1.25rem;margin-bottom:1rem;cursor:pointer" onclick="openEventDetail('${ev.id}')">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap">
        <div style="flex:1">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem;letter-spacing:1px">${ev.title}</div>
          <div style="font-size:.85rem;color:var(--muted);margin-top:.25rem">${type.label} · ${ev.date||'Data TBD'}${ev.time ? ' · <b style="color:var(--text)">' + ev.time + '</b>' : ''}</div>

        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-weight:700;font-size:.85rem;color:${status.color}">${status.label}</div>
          <div style="font-size:.8rem;color:var(--muted);margin-top:.2rem">👥 ${playerCount}${ev.maxPlayers?'/'+ev.maxPlayers:''} graczy</div>
          ${discordUser && ['closed','draft'].includes(ev.status) && (ev.teams||[]).some(t => t.captain?.id === discordUser.id) ? `
          <button onclick="event.stopPropagation();openGMPanel('${ev.id}')"
            style="margin-top:.4rem;background:var(--accent);border:none;color:#000;border-radius:6px;padding:.3rem .75rem;font-size:.78rem;cursor:pointer;font-family:inherit;font-weight:700;display:block;width:100%">
            🎮 Panel GM
          </button>` : ''}
        </div>
      </div>
      ${ev.shared || ev._peer ? `<div style="margin-top:.5rem;font-size:.74rem;color:var(--accent);font-weight:700">🌍 ${_g('Wspólny draft PL + EU — jedna lista zapisów', 'Shared draft PL + EU — one sign-up list')}</div>` : ''}
       ${_isEventsAdminSync() && !ev._peer ? `<div style="display:flex;gap:.5rem;margin-top:.75rem;flex-wrap:wrap">
        <button onclick="event.stopPropagation();openEditEventModal('${ev.id}')"
          style="background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:.25rem .75rem;font-size:.8rem;cursor:pointer;font-family:inherit">✏️ Edytuj</button>
        <button onclick="event.stopPropagation();backfillSignupOvr('${ev.id}')" title="Oblicz i zapisz OVR graczy z momentu zapisu"
          style="background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:.25rem .75rem;font-size:.8rem;cursor:pointer;font-family:inherit">📊 Uzupełnij OVR</button>
        <button onclick="event.stopPropagation();deleteEvent('${ev.id}')"
          style="background:transparent;border:1px solid var(--border);color:var(--loss);border-radius:6px;padding:.25rem .75rem;font-size:.8rem;cursor:pointer;font-family:inherit">🗑 Usuń</button>
        ${ev.status === 'open' ? `<button onclick="event.stopPropagation();closeEventSignups('${ev.id}')"
          style="background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:.25rem .75rem;font-size:.8rem;cursor:pointer;font-family:inherit">${currentLang==='en'?'🔒 Close sign-ups':'🔒 Zamknij zapisy'}</button>` : ''}
        ${ev.status === 'closed' && ev.type === 'draft' ? `<button onclick="event.stopPropagation();openDraftSetup('${ev.id}')" style="background:var(--accent);border:none;color:#000;border-radius:6px;padding:.25rem .75rem;font-size:.8rem;cursor:pointer;font-family:inherit;font-weight:700">⚙️ Setup Draftu</button>` : ''}
        ${ev.status === 'draft' ? `<button onclick="event.stopPropagation();openDraftView('${ev.id}')"
          style="background:var(--accent);border:none;color:#000;border-radius:6px;padding:.25rem .75rem;font-size:.8rem;cursor:pointer;font-family:inherit;font-weight:700">🎯 Wróć do Draft</button>` : ''}
        ${ev.status === 'closed' && ev.type === 'pickup' ? `<button onclick="event.stopPropagation();randomizeTeams('${ev.id}')"
          style="background:var(--accent);border:none;color:#000;border-radius:6px;padding:.25rem .75rem;font-size:.8rem;cursor:pointer;font-family:inherit;font-weight:700">🎲 Losuj drużyny</button>` : ''}
        ${ev.status === 'active' ? `<button onclick="event.stopPropagation();finishEvent('${ev.id}')"
          style="background:transparent;border:1px solid var(--accent);color:var(--accent);border-radius:6px;padding:.25rem .75rem;font-size:.8rem;cursor:pointer;font-family:inherit;font-weight:700">✅ Zakończ event</button>` : ''}
      </div>` : ''}
    </div>`;
  }).join('');
}

function openCreateEventModal(){return __lz(9,'openCreateEventModal',this,arguments)}

function openEditEventModal(){return __lz(9,'openEditEventModal',this,arguments)}

function saveEvent(){return __lz(9,'saveEvent',this,arguments)}

function deleteEvent(){return __lz(9,'deleteEvent',this,arguments)}
function finishEvent(){return __lz(9,'finishEvent',this,arguments)}



function removeTestEvents(){return __lz(9,'removeTestEvents',this,arguments)}
function openEventsRestore(){return __lz(9,'openEventsRestore',this,arguments)}
function evRestoreLoad(){return __lz(9,'evRestoreLoad',this,arguments)}
function evRestoreApply(){return __lz(9,'evRestoreApply',this,arguments)}

function loadTestEvents(){return __lz(9,'loadTestEvents',this,arguments)}


function closeEventSignups(){return __lz(9,'closeEventSignups',this,arguments)}

function randomizeTeams(){return __lz(9,'randomizeTeams',this,arguments)}

function openEventDetail(){return __lz(9,'openEventDetail',this,arguments)}

function renderEventDetailTab(){return __lz(9,'renderEventDetailTab',this,arguments)}
function _renderEventDetailTabInner(){return __lz(9,'_renderEventDetailTabInner',this,arguments)}

function renderEventStats(){return __lz(9,'renderEventStats',this,arguments)}

function openEventPlayerModal(){return __lz(9,'openEventPlayerModal',this,arguments)}

// Event match screenshot upload
let _evParseBase64 = null, _evParseMime = null, _evParsePending = null;
let _evParseDataUrl = null, _evParseQueue = [], _evParseQueueIdx = 0;

function evFileSelected(){return __lz(9,'evFileSelected',this,arguments)}
function evDropFile(){return __lz(9,'evDropFile',this,arguments)}
function evProcessNextInQueue(){return __lz(9,'evProcessNextInQueue',this,arguments)}
function evLoadFile(){return __lz(9,'evLoadFile',this,arguments)}

function evParseScreenshot(){return __lz(9,'evParseScreenshot',this,arguments)}

function evSaveMatch(){return __lz(9,'evSaveMatch',this,arguments)}

function evSkipMatch(){return __lz(9,'evSkipMatch',this,arguments)}

// ── Merge event matches ──────────────────────────────────────────────────────
const _evMergeSelected = {}; function evMergeToggle(){return __lz(9,'evMergeToggle',this,arguments)}

function mergeEventMatches(){return __lz(9,'mergeEventMatches',this,arguments)}

function deleteEventMatch(){return __lz(9,'deleteEventMatch',this,arguments)}

function openEditEventMatch(){return __lz(9,'openEditEventMatch',this,arguments)}

function saveEditEventMatch(){return __lz(9,'saveEditEventMatch',this,arguments)}

// ── Dopasowanie nazw graczy z eventów do nazw z rankingu ligowego ──

let _evNameFixList = []; function openEvNameFix(){return __lz(9,'openEvNameFix',this,arguments)}

function applySingleEvFix(){return __lz(9,'applySingleEvFix',this,arguments)}

function applyAllEvFixes(){return __lz(9,'applyAllEvFixes',this,arguments)}

function _applyEvPlayerRename(){return __lz(9,'_applyEvPlayerRename',this,arguments)}

function openEventMatchDetail(){return __lz(9,'openEventMatchDetail',this,arguments)}

function _notifyDateStr(){return __lz(9,'_notifyDateStr',this,arguments)}
function _notifyDefaultMsg(){return __lz(9,'_notifyDefaultMsg',this,arguments)}
function openNotifyModal(){return __lz(9,'openNotifyModal',this,arguments)}

function updateNotifyPreview(){return __lz(9,'updateNotifyPreview',this,arguments)}

function sendDraftNotification(){return __lz(9,'sendDraftNotification',this,arguments)}

function addPlayerManually(){return __lz(9,'addPlayerManually',this,arguments)}

function removePlayerFromEvent(){return __lz(9,'removePlayerFromEvent',this,arguments)}

function backfillSignupOvr(){return __lz(9,'backfillSignupOvr',this,arguments)}


// ═══ 📝 ZAPISY NA EVENT (przez Workera, z listą rezerwową) ═══
function _eventsMetaHeader() {
  try {
    const list = (events || []).filter(e => !e._peer && ['open', 'closed', 'draft'].includes(e.status)).slice(-15)
      .map(e => ({ id: e.id, t: String(e.title || '').slice(0, 60), s: e.status, m: +e.maxPlayers || 0, p: (e.players || []).map(p => p.id), w: (e.waitlist || []).map(p => p.id) }));
    return encodeURIComponent(JSON.stringify(list));
  } catch(e) { return ''; }
}
let _evsMergedIds = [];
function _evsMerge(ov) {
  _evsMergedIds = [];
  Object.entries(ov || {}).forEach(([id, o]) => {
    const ev = (events || []).find(e => e.id === id); if(!ev) return;
    ev.players = ev.players || []; ev.waitlist = ev.waitlist || [];
    const before = JSON.stringify([ev.players.map(p => p.id), ev.waitlist.map(p => p.id)]);
    const del = o.del || {};
    ev.players = ev.players.filter(p => !(del[p.id] && !(o.add?.[p.id])));
    ev.waitlist = ev.waitlist.filter(p => !(del[p.id] && !(o.add?.[p.id])));
    Object.values(o.add || {}).sort((a, b) => String(a.at).localeCompare(String(b.at))).forEach(a => {
      const inMain = ev.players.find(p => p.id === a.id), inWait = ev.waitlist.find(p => p.id === a.id);
      if(a.waitlist) { if(!inMain && !inWait) ev.waitlist.push(a); return; }
      if(inMain) return;
      const base = inWait || a; ev.waitlist = ev.waitlist.filter(p => p.id !== a.id);
      ev.players.push({ ...base, ...(a.promotedFromBase ? {} : a), waitlist: undefined });
    });
    (o.promoted || []).forEach(pid => { const w = ev.waitlist.find(p => p.id === pid); if(w) { ev.waitlist = ev.waitlist.filter(p => p.id !== pid); if(!ev.players.find(p => p.id === pid)) ev.players.push(w); } });
    if(JSON.stringify([ev.players.map(p => p.id), ev.waitlist.map(p => p.id)]) !== before) _evsMergedIds.push(id);
  });
  // admin: Worker musi znać spis eventów (status, limit, zapisani), żeby przyjmować zapisy
  if(_isLoggedInSync() && !_evsMergedIds.length && (events || []).some(e => e.status === 'open'))
    setTimeout(() => _api('/event-signup/compact', 'POST', { meta: _eventsMetaHeader() }, { admin: true }).catch(() => {}), 2000);
  // admin: utrwal scalone zapisy w bazie i wyczyść nakładkę w Workerze
  if(_evsMergedIds.length && _isLoggedInSync()) setTimeout(async () => {
    const ids = [..._evsMergedIds];
    if(await saveData(true)) _api('/event-signup/compact', 'POST', { eventIds: ids }, { admin: true }).catch(() => {});
  }, 2500);
}

function signupToEvent(){return __lz(9,'signupToEvent',this,arguments)}

function openPositionPickerModal(){return __lz(9,'openPositionPickerModal',this,arguments)}

function _doEventSignup(){return __lz(9,'_doEventSignup',this,arguments)}
function confirmSignupWithPositions(){return __lz(9,'confirmSignupWithPositions',this,arguments)}

function showSignupWelcome(){return __lz(9,'showSignupWelcome',this,arguments)}

let _primaryPos = null;
let _secondaryPos = new Set();
let _speaksEnglish = false;

// Manual add player position state
let _manualPrimaryPos = null;
let _manualSecondaryPos = new Set();
let _manualEnglish = false;

function selectManualPos(){return __lz(9,'selectManualPos',this,arguments)}

function toggleManualSecPos(){return __lz(9,'toggleManualSecPos',this,arguments)}

function toggleManualEnglish(){return __lz(9,'toggleManualEnglish',this,arguments)}

function selectPrimaryPos(){return __lz(9,'selectPrimaryPos',this,arguments)}

function toggleSecondaryPos(){return __lz(9,'toggleSecondaryPos',this,arguments)}

function updateSecondaryVisuals(){return __lz(9,'updateSecondaryVisuals',this,arguments)}

function toggleEnglish(){return __lz(9,'toggleEnglish',this,arguments)}

function openPositionPickerWithLang(){return __lz(9,'openPositionPickerWithLang',this,arguments)}

function togglePosLabel(){return __lz(9,'togglePosLabel',this,arguments)}

function cancelSignup(){return __lz(9,'cancelSignup',this,arguments)}

async function _adminViaDiscord(silent) {
  const r = await _api('/admin-login', 'POST', {}, { session: true });
  if(!r.ok || !r.token) return false;
  localStorage.setItem('nba2k_auth', 'ok');
  localStorage.setItem('nba2k_admin_token_hash', r.token);
  localStorage.setItem('nba2k_admin_via_discord', '1');
  if(silent) return true;
  updateAuthUI(); renderDashboard();
  showToast('👑 Zalogowano jako admin (Discord)', 'success');
  return true;
}
// 👑 odnowienie sesji admina z wyprzedzeniem (dzień przed wygaśnięciem) i zamiana starego, stałego tokenu na sesję z Discorda
setTimeout(async () => { try { const t = _adminToken(); if(!t || !discordUser?.session) return;
  if(!t.startsWith('adm1.')) { if(localStorage.getItem('nba2k_admin_token_hash')) await _adminViaDiscord(true); return; }
  const p = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); if(p.exp * 1000 - Date.now() < 864e5) await _adminViaDiscord(true); } catch(e) {} }, 4000);
function logoutDiscord(){return __lz(9,'logoutDiscord',this,arguments)}

function loginWithDiscord(){return __lz(9,'loginWithDiscord',this,arguments)}


function openManualCaptainsModal(){return __lz(9,'openManualCaptainsModal',this,arguments)}

function confirmManualCaptains(){return __lz(9,'confirmManualCaptains',this,arguments)}

function assignCaptains(){return __lz(9,'assignCaptains',this,arguments)}

function buildDraftOrder(method, numTeams, totalPicks) {
  if(method === 'linear') {
    // Linear: 0,1,2,0,1,2,0,1,2...
    return Array.from({length: totalPicks}, (_, i) => i % numTeams);
  }
  // Default: snake
  const order = [];
  let round = 0;
  while(order.length < totalPicks) {
    const forward = round % 2 === 0;
    const indices = forward
      ? Array.from({length: numTeams}, (_, i) => i)
      : Array.from({length: numTeams}, (_, i) => numTeams - 1 - i);
    indices.forEach(function(i) {
      if(order.length < totalPicks) order.push(i);
    });
    round++;
  }
  return order;
}

function startDraft(){return __lz(9,'startDraft',this,arguments)}

function reassignCaptainsFromModal(){return __lz(9,'reassignCaptainsFromModal',this,arguments)}

function refreshStartDraftModal(){return __lz(9,'refreshStartDraftModal',this,arguments)}

function shufflePickOrder(){return __lz(9,'shufflePickOrder',this,arguments)}

function confirmStartDraft(){return __lz(9,'confirmStartDraft',this,arguments)}

let _draftPollInterval = null;

function updateDraftMethodDesc(){return __lz(9,'updateDraftMethodDesc',this,arguments)}

function stopDraftPolling(){return __lz(9,'stopDraftPolling',this,arguments)}

// Timer for draft picks
let _draftTimerInterval = null;
let _draftTimerEventId = null;
let _draftTimerFired = false;
function startDraftTimer(){return __lz(9,'startDraftTimer',this,arguments)}

function startDraftPolling(){return __lz(9,'startDraftPolling',this,arguments)}

function openDraftView(){return __lz(9,'openDraftView',this,arguments)}

function renderDraftView(){return __lz(9,'renderDraftView',this,arguments)}

// ═══ 🎯 DRAFT EVENTU — stan na Workerze (/ev-draft), bez zapisu całej bazy przy każdym picku ═══
const _EVD_FIELDS = ['teams', 'draftPool', 'draftOrder', 'draftTurn', 'draftPaused', 'timerEnd', 'timerSecs', 'lastPick', 'gmOnline'];
function _evdApply(){return __lz(9,'_evdApply',this,arguments)}
function _evdState(){return __lz(9,'_evdState',this,arguments)}
function _evdInit(){return __lz(9,'_evdInit',this,arguments)}
function _evdAdmin(){return __lz(9,'_evdAdmin',this,arguments)}
function _evdFetch(){return __lz(9,'_evdFetch',this,arguments)}
function _evdRefreshViews(){return __lz(9,'_evdRefreshViews',this,arguments)}

function draftPickPlayer(){return __lz(9,'draftPickPlayer',this,arguments)}

function adminPickFor(){return __lz(9,'adminPickFor',this,arguments)}

function _showGMAuthPrompt(){return __lz(9,'_showGMAuthPrompt',this,arguments)}

function _submitGMAuth(){return __lz(9,'_submitGMAuth',this,arguments)}

function _gmSetDraftPwd(){return __lz(9,'_gmSetDraftPwd',this,arguments)}

function pingGmPresence(){return __lz(9,'pingGmPresence',this,arguments)}

function fetchGmPresence(){return __lz(9,'fetchGmPresence',this,arguments)}

function dvPollCaptains(){return __lz(9,'dvPollCaptains',this,arguments)}

function draftUndoPick(){return __lz(9,'draftUndoPick',this,arguments)}

function draftPlay(){return __lz(9,'draftPlay',this,arguments)}

function draftPause(){return __lz(9,'draftPause',this,arguments)}

function openGMPanel(){return __lz(9,'openGMPanel',this,arguments)}

function _openGMPanelCore(){return __lz(9,'_openGMPanelCore',this,arguments)}

function closeGMPanel(){return __lz(9,'closeGMPanel',this,arguments)}

function renderGMPanel(){return __lz(9,'renderGMPanel',this,arguments)}

function _gmToggleWatch(){return __lz(9,'_gmToggleWatch',this,arguments)}

function _gmToggleQueue(){return __lz(9,'_gmToggleQueue',this,arguments)}

function _gmMoveQueue(){return __lz(9,'_gmMoveQueue',this,arguments)}

let _gmTimerInterval = null;
function startGMTimer(){return __lz(9,'startGMTimer',this,arguments)}

// Poll for GM panel updates
let _gmPollInterval = null;
let _gmPresencePingedAt = 0;
function startGMPolling(){return __lz(9,'startGMPolling',this,arguments)}
function _gmIsMyTurn(){return __lz(9,'_gmIsMyTurn',this,arguments)}
function _gmTurnAlert(){return __lz(9,'_gmTurnAlert',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// 🤖 OCENY DRAFTU (AI) + GRAFIKA DRUŻYN NA DISCORD
// ═══════════════════════════════════════════════════════════════
const _GRADE_COL = g => /^A/.test(g) ? '#4ade80' : /^B/.test(g) ? '#a3e635' : /^C/.test(g) ? '#f5c518' : /^D/.test(g) ? '#fb923c' : '#f87171';
function _draftTeamsInfo(){return __lz(10,'_draftTeamsInfo',this,arguments)}
function _gradesFallback(){return __lz(10,'_gradesFallback',this,arguments)}
function draftGrade(){return __lz(10,'draftGrade',this,arguments)}
function _draftGradesHtml(ev, compact) {
  const g = ev.draftGrades || []; if(!g.length) return '';
  return `<div style="margin:${compact ? '.8rem 0' : '1.2rem 0'};text-align:left">
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;letter-spacing:1px;color:#e8eaf0;margin-bottom:.5rem">🤖 OCENY DRAFTU</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.5rem">
      ${g.map(x => `<div style="background:#10131a;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:.6rem .7rem;display:flex;gap:.6rem;align-items:flex-start">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2rem;line-height:1;color:${_GRADE_COL(x.grade)};min-width:44px;text-align:center">${_h(x.grade)}</div>
        <div style="min-width:0"><div style="font-weight:800;color:#e8eaf0">${_h(x.team)}${x.avgOvr ? ` <span style="font-size:.7rem;color:#8a93a8">· OVR ${x.avgOvr}</span>` : ''}</div>
          <div style="font-size:.78rem;color:#c9ced8;line-height:1.4;margin-top:.15rem">${_h(x.comment || '')}</div></div>
      </div>`).join('')}
    </div>
  </div>`;
}
function _draftGradesImage(){return __lz(10,'_draftGradesImage',this,arguments)}
function postDraftGrades(){return __lz(10,'postDraftGrades',this,arguments)}

function finishDraft(){return __lz(10,'finishDraft',this,arguments)}


function copyGmLink(){return __lz(10,'copyGmLink',this,arguments)}

function copyDraftWatchLink(){return __lz(10,'copyDraftWatchLink',this,arguments)}

function copyDraftOverlayLink(){return __lz(10,'copyDraftOverlayLink',this,arguments)}

function checkDraftWatchParam() {
  const params = new URLSearchParams(window.location.search);
  const watchId = params.get('watch_draft');
  if(!watchId) return;
  // Keep param in URL so polling can re-check after refresh
  // Wait for data to load, then open draft
  const tryOpen = (attempts) => {
    const ev = events.find(e => e.id === watchId);
    if(ev && (ev.status === 'draft' || ev.status === 'active')) {
      // Remove param from URL only when successfully opened
      const url = new URL(window.location.href);
      url.searchParams.delete('watch_draft');
      window.history.replaceState({}, '', url.toString());
      openDraftView(watchId);
      startDraftPolling(watchId);
    } else if(attempts > 0) {
      setTimeout(() => tryOpen(attempts - 1), 600);
    } else {
      // Draft not found or not started yet — show info on events page
      showView('events');
      const ev2 = events.find(e => e.id === watchId);
      if(!ev2) {
        showToast('❌ Nie znaleziono draftu. Może jeszcze nie wystartował?', 'error');
      } else {
        showToast('ℹ️ Draft "' + (ev2.title||'') + '" jeszcze nie wystartował. Odśwież stronę gdy admin uruchomi draft.', 'info');
      }
    }
  };
  // Show events view while waiting
  showView('events');
  setTimeout(() => tryOpen(15), 1000);
}

function getDefaultRound() {
  // When no rounds defined, treat all matches as round 1
  const dates = matches.map(m => m.date).filter(Boolean).sort();
  const from = dates[0] || '2000-01-01';
  const to   = dates[dates.length-1] || new Date().toISOString().slice(0,10);
  return { id:'r1', label:'1. Kolejka', from, to };
}

function getCurrentRound() {
  if(!rounds.length) return getDefaultRound();
  const today = new Date().toISOString().slice(0,10);
  for(const r of rounds) {
    if(today >= r.from && today <= r.to) return r;
  }
  // Return last round if past all rounds
  return rounds[rounds.length-1];
}

function buildRoundFive(roundMatches) {
  const totalGames = roundMatches.length;
  // Minimum games: at least 1/6 of total matches in round (min 1, max 3)
  const minGP = Math.min(3, Math.max(1, Math.ceil(totalGames / 6)));
  const POSITIONS = ['PG','SG','SF','PF','C'];
  const playerMap = {};
  roundMatches.forEach(m => {
    [m.team1, m.team2].forEach(team => {
      (team.players||[]).forEach((p,idx) => {
        const pos = p.pos || POSITIONS[idx] || 'PG';
        const key = p.name + '|' + pos;
        if(!playerMap[key]) playerMap[key] = {name:p.name,team:team.name,pos,posCounts:{},gp:0,pts:0,reb:0,ast:0,stl:0,blk:0,to:0,fgm:0,fga:0,tpm:0,tpa:0,ftm:0,fta:0,gradeSum:0};
        const s = playerMap[key];
        s.gp++; s.pts+=p.pts||0; s.reb+=p.reb||0; s.ast+=p.ast||0;
        s.stl+=p.stl||0; s.blk+=p.blk||0; s.to+=p.to||0;
        s.fgm+=p.fgm||0; s.fga+=p.fga||0; s.tpm+=p.tpm||0; s.tpa+=p.tpa||0; s.ftm+=p.ftm||0; s.fta+=p.fta||0;
        s.gradeSum+=gradeToNum(p.grade||'B');
       if(p.pos) { if(!s.posCounts) s.posCounts={}; s.posCounts[p.pos]=(s.posCounts[p.pos]||0)+1; }
       if(p.pos) { if(!s.posCounts) s.posCounts={}; s.posCounts[p.pos]=(s.posCounts[p.pos]||0)+1; }
       if(p.pos) { if(!s.posCounts) s.posCounts={}; s.posCounts[p.pos]=(s.posCounts[p.pos]||0)+1; }
        if(p.pos) s.posCounts[p.pos] = (s.posCounts[p.pos]||0)+1;
      });
    });
  });
  // Set primary position = most frequent
  Object.values(playerMap).forEach(pl => {
    if(Object.keys(pl.posCounts||{}).length) pl.pos = Object.entries(pl.posCounts).sort((a,b)=>b[1]-a[1])[0][0];
  });
  const players = Object.values(playerMap)
    .filter(p => p.gp >= minGP)
    .map(p => ({
      ...p, avgGrade: p.gradeSum/p.gp,
      score: calcCompositeScore(p)
    }));
  const best = {};
  POSITIONS.forEach(pos => {
    const c = players.filter(p => p.pos === pos);
    if(c.length) best[pos] = c.sort((a,b)=>b.score-a.score)[0];
  });
  return { best, POSITIONS, minGP };
}

function renderRoundFiveBlock(round, roundMatches) {
  if(!roundMatches.length) return '';
  const { best, POSITIONS, minGP } = buildRoundFive(roundMatches);
  const hasBest = Object.keys(best).length > 0;
  const cards = POSITIONS.map(pos => {
    const p = best[pos];
    if(!p) return '<div class="tow-card"><div class="tow-pos">'+pos+'</div><div style="color:var(--muted);font-size:.75rem">Brak<br>(min.'+minGP+' mecze)</div></div>';
    const gr = numToGrade(p.avgGrade);
    const pts=(p.pts/p.gp).toFixed(1), reb=(p.reb/p.gp).toFixed(1), ast=(p.ast/p.gp).toFixed(1);
    const esc = s => s.replace(/'/g,"\'");
    return '<div class="tow-card" onclick="openPlayerModal(\'' + esc(p.name) + '\',\'' + esc(p.team) + '\')">'
      +'<div class="tow-pos">'+pos+'</div>'
      +'<div class="tow-name">'+p.name+'</div>'
      +'<div class="tow-team">'+p.team+'</div>'
      +'<div class="tow-score"><span class="grade grade-'+gr.replace('+','p').replace('-','m')+'">'+gr+'</span></div>'
      +'<div class="tow-stats">'+pts+' PTS · '+reb+' REB · '+ast+' AST</div>'
      +'<div style="font-size:.65rem;color:var(--muted)">'+p.gp+' '+t('games_count')+'</div>'
      +'</div>';
  }).join('');
  return '<div style="margin-bottom:1.5rem">'
    +'<div style="font-family:Barlow Condensed,sans-serif;font-weight:700;font-size:1rem;letter-spacing:1px;text-transform:uppercase;color:var(--accent);margin-bottom:.6rem;display:flex;align-items:center;gap:.6rem">'
    +'🏅 '+round.label
    +'<span style="color:var(--muted);font-weight:400;font-size:.75rem;text-transform:none">· '+roundMatches.length+' '+t('games_count')+' · min. '+minGP+' mecz'+(minGP===1?'':'e')+'/zawodnik</span>'
    +'</div>'
    +(hasBest ? '<div class="tow-grid">'+cards+'</div>' : '<div style="color:var(--muted);font-size:.85rem">Za mało danych (zawodnicy muszą mieć przypisane pozycje)</div>')
    +'</div>';
}

function renderTeamOfWeek() {
  const wrap = document.getElementById('team-of-week-wrap');
  if(!wrap) return;
  const today = new Date().toISOString().slice(0,10);

  const activeRounds = (rounds && rounds.length
    ? rounds
    : [getDefaultRound()]
  ).filter(r => r.from <= today).sort((a,b) => a.from.localeCompare(b.from));

  if(!activeRounds.length) {
    wrap.innerHTML = '<div style="color:var(--muted);font-size:.9rem">'+t('no_rounds_defined')+'</div>';
    return;
  }

  const html = activeRounds.map(round => {
    const roundMatches = matches.filter(m => m.date >= round.from && m.date <= round.to);
    return renderRoundFiveBlock(round, roundMatches);
  }).join('');

  wrap.innerHTML = html || '<div style="color:var(--muted);font-size:.9rem">'+t('no_round_matches')+'</div>';
}


function calcRawScore(p) {
  // CS bez kary za mało meczów — czysta jakość gracza per game
  const gp = Math.max(p.gp, 1);
  const gradeScore = (p.gradeSum / gp) / 13 * 100;
  const ptsScore   = Math.min((p.pts / gp) / 50 * 100, 100);
  const astScore   = Math.min((p.ast / gp) / 15 * 100, 100);
  const rebScore   = Math.min((p.reb / gp) / 20 * 100, 100);
  const stlScore   = Math.min((p.stl / gp) / 4  * 100, 100);
  const blkScore   = Math.min((p.blk / gp) / 3  * 100, 100);
  return ptsScore*0.25 + stlScore*0.20 + blkScore*0.18 + rebScore*0.15 + astScore*0.12 + gradeScore*0.10;
}

function calcCompositeScore(p) {
  // Composite: PTS(25%) + STL(20%) + BLK(18%) + REB(15%) + AST(12%) + ocena(10%)
  // Współczynnik GP (maturity) — mocna kara za mało meczów:
  //   1 mecz  = 0.20,  3 mecze = 0.43,  5 = 0.58,  8 = 0.73
  //  10 mecze = 0.80, 15 = 0.89, 20+ → ~1.0
  // Wzór: gp / (gp + 5) — przy 5 meczach gracz ma 50% siły, przy 15 meczach 75%
  const gp = Math.max(p.gp, 1);
  const maturity = gp / (gp + 5);  // 0..1, asymptotycznie → 1.0
  const gradeScore = (p.gradeSum / gp) / 13 * 100;
  const ptsScore   = Math.min((p.pts / gp) / 50 * 100, 100);
  const astScore   = Math.min((p.ast / gp) / 15 * 100, 100);
  const rebScore   = Math.min((p.reb / gp) / 20 * 100, 100);
  const stlScore   = Math.min((p.stl / gp) / 4  * 100, 100);
  const blkScore   = Math.min((p.blk / gp) / 3  * 100, 100);
  const baseScore  = ptsScore*0.25 + stlScore*0.20 + blkScore*0.18 + rebScore*0.15 + astScore*0.12 + gradeScore*0.10;
  return baseScore * maturity;
}

function getSeasonMVP(){return __lz(10,'getSeasonMVP',this,arguments)}

function renderSeasonMVPBlock(){return __lz(10,'renderSeasonMVPBlock',this,arguments)}

function calcPER(p) {
  // Uproszczone PER (bez minut) wg Hollingera
  // PER = (PTS + REB + AST + STL + BLK - missedFG - missedFT - TO) / GP
  const gp = Math.max(p.gp, 1);
  const missedFG = (p.fga - p.fgm) || 0;
  const missedFT = (p.fta - p.ftm) || 0;
  const raw = (p.pts + p.reb + p.ast + p.stl + p.blk - missedFG - missedFT - p.to) / gp;
  return Math.round(raw * 10) / 10;
}

let _top10SeasonId = null, _top10SeasonName = null;

function openTop10Modal(){return __lz(10,'openTop10Modal',this,arguments)}

function renderTop10Tab(){return __lz(10,'renderTop10Tab',this,arguments)}


document.addEventListener('click',function(e){
  var t=e.target.closest('.tlink');
  if(t){openTeamModal(t.getAttribute('data-t'));return;}
  var p=e.target.closest('.prow');
  if(p){document.getElementById('team-modal').classList.remove('open');setTimeout(function(){openTeamModal._openPlayer(p.getAttribute('data-n'),p.getAttribute('data-t'));},150);return;}
});
function openTeamModal(tn){
  var pm={};
  matches.forEach(function(m){[m.team1,m.team2].forEach(function(t){
    if(t.name!==tn)return;
    (t.players||[]).forEach(function(p){
      if(!pm[p.name])pm[p.name]={name:p.name,gp:0,pts:0,reb:0,ast:0,stl:0,blk:0,to:0,fgm:0,fga:0,tpm:0,tpa:0,ftm:0,fta:0,gs:0};
      var s=pm[p.name];s.gp++;s.pts+=p.pts||0;s.reb+=p.reb||0;s.ast+=p.ast||0;s.stl+=p.stl||0;s.blk+=p.blk||0;
      s.to+=p.to||0;s.fgm+=p.fgm||0;s.fga+=p.fga||0;s.tpm+=p.tpm||0;s.tpa+=p.tpa||0;s.ftm+=p.ftm||0;s.fta+=p.fta||0;s.gs+=gradeToNum(p.grade);
    });
  });});
  var pl=Object.values(pm).map(function(p){
    var pFull={name:p.name,team:tn,pos:p.pos||'',gp:p.gp,pts:p.pts,reb:p.reb,ast:p.ast,stl:p.stl,blk:p.blk,to:p.to,fgm:p.fgm,fga:p.fga,tpm:p.tpm,tpa:p.tpa,ftm:p.ftm,fta:p.fta,gradeSum:p.gs};
    return Object.assign(p, {_cs: calcCompositeScore(pFull)});
  }).sort(function(a,b){return b._cs-a._cs;});
  var w=0,l=0,pf=0,pa=0;
  matches.forEach(function(m){
    if(m.team1.name===tn){w+=m.team1.score>m.team2.score?1:0;l+=m.team1.score<m.team2.score?1:0;pf+=m.team1.score;pa+=m.team2.score;}
    if(m.team2.name===tn){w+=m.team2.score>m.team1.score?1:0;l+=m.team2.score<m.team1.score?1:0;pf+=m.team2.score;pa+=m.team1.score;}
  });
  var gp=w+l;
  var rows=pl.map(function(p){
    var a=function(v){return p.gp>0?(v/p.gp).toFixed(1):'0.0';};
    var ag=numToGrade(p.gp>0?p.gs/p.gp:0);
    var pFull={name:p.name,team:tn,pos:p.pos||'',gp:p.gp,pts:p.pts,reb:p.reb,ast:p.ast,stl:p.stl,blk:p.blk,to:p.to,fgm:p.fgm,fga:p.fga,tpm:p.tpm,tpa:p.tpa,ftm:p.ftm,fta:p.fta,gradeSum:p.gs};
    var cs=calcCompositeScore(pFull).toFixed(1);
    var per=calcPER(pFull).toFixed(1);
    return '<tr class="prow" data-n="'+p.name.replace(/"/g,'&quot;')+'" data-t="'+tn.replace(/"/g,'&quot;')+'" style="cursor:pointer">'
      +'<td style="font-weight:600">'+p.name+'</td><td>'+p.gp+'</td>'
      +'<td><span class="grade grade-'+ag.replace('+','p').replace('-','m')+'">'+ag+'</span></td>'
      +'<td style="color:var(--accent);font-weight:700">'+cs+'</td>'
      +'<td style="color:#3498db;font-weight:700">'+per+'</td>'
      +'<td style="color:var(--accent);font-weight:700">'+a(p.pts)+'</td>'
      +'<td>'+a(p.reb)+'</td><td>'+a(p.ast)+'</td><td>'+a(p.stl)+'</td><td>'+a(p.blk)+'</td><td>'+a(p.to)+'</td>'
      +'<td>'+(p.fga>0?Math.round(p.fgm/p.fga*100):0)+'%</td><td>'+(p.tpa>0?Math.round(p.tpm/p.tpa*100):0)+'%</td><td>'+(p.fta>0?Math.round(p.ftm/p.fta*100):0)+'%</td></tr>';
  }).join('');
  document.getElementById('team-modal-content').innerHTML=
    '<div style="margin-bottom:1.5rem"><div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.25rem">'+teamLogo(tn,52,'1.2rem')+'<div style="font-family:Barlow Condensed,sans-serif;font-weight:900;font-size:2rem;letter-spacing:2px;text-transform:uppercase">'+tn+'</div><button id="team-share-btn" title="Udostępnij" style="display:inline-flex;align-items:center;justify-content:center;background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:6px;width:28px;height:28px;cursor:pointer;flex-shrink:0">&#8599;</button></div>'
    +'<div style="display:flex;gap:1.5rem;margin-top:0.5rem;flex-wrap:wrap">'
    +'<span style="color:var(--win);font-weight:700">'+w+'W</span><span style="color:var(--loss);font-weight:700">'+l+'L</span>'
    +'<span style="color:var(--muted)">PPG: <strong style="color:var(--text)">'+(gp>0?(pf/gp).toFixed(1):'0.0')+'</strong></span>'
    +'<span style="color:var(--muted)">OPP: <strong style="color:var(--text)">'+(gp>0?(pa/gp).toFixed(1):'0.0')+'</strong></span>'
    +'</div></div>'
    +'<div class="stats-table-wrap"><table><thead><tr><th style="text-align:left">Zawodnik</th><th>GP</th><th>GRD</th><th title="Composite Score" style="color:var(--accent)">CS</th><th title="Player Efficiency Rating" style="color:#3498db">PER</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>TO</th><th>FG%</th><th>3P%</th><th>FT%</th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table></div>'
    +'<p style="color:var(--muted);font-size:0.8rem;margin-top:1rem">Kliknij zawodnika aby zobaczyc profil</p>'
    // Historia meczów drużyny — pełna z filtrami
    +(function(){
      var allTm=[...matches].filter(function(m){return m.team1.name===tn||m.team2.name===tn;}).sort(function(a,b){return new Date(b.date)-new Date(a.date);});
      if(!allTm.length) return '';

      // Build season options
      var seasonIds=[...new Set(allTm.map(function(m){return m.seasonId||'';}).filter(Boolean))];
      var seasonOpts='<option value="">— Wszystkie sezony —</option>'
        +seasonIds.map(function(sid){var sn=seasons.find(function(s){return s.id===sid;});return '<option value="'+sid+'">'+(sn?sn.name:sid)+'</option>';}).join('');

      // Build round options — use rounds that contain at least one match by date
      var relevantRounds = rounds.filter(function(r){
        return allTm.some(function(m){ return m.date >= r.from && m.date <= r.to; });
      }).sort(function(a,b){ return a.from.localeCompare(b.from); });
      var roundOpts='<option value="">— Wszystkie kolejki —</option>'
        +relevantRounds.map(function(r){return '<option value="'+r.id+'">'+r.label+'</option>';}).join('');

      // Store team name for filter function
      window._teamModalName = tn;
      window._teamModalMatches = allTm;

      var filterBar='<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem;align-items:center">'
        +'<select id="tmf-season" onchange="renderTeamMatchHistory()" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .5rem;font-size:.8rem;font-family:inherit">'+seasonOpts+'</select>'
        +'<select id="tmf-round" onchange="renderTeamMatchHistory()" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .5rem;font-size:.8rem;font-family:inherit">'+roundOpts+'</select>'
        +'<select id="tmf-result" onchange="renderTeamMatchHistory()" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .5rem;font-size:.8rem;font-family:inherit">'
          +'<option value="">W/L — wszystkie</option><option value="W">Tylko wygrane</option><option value="L">Tylko przegrane</option>'
        +'</select>'
        +'<span id="tmf-count" style="font-size:.8rem;color:var(--muted);margin-left:.25rem"></span>'
        +'</div>';

      return '<div style="margin-top:1.5rem">'
        +'<div style="font-family:Barlow Condensed,sans-serif;font-weight:700;font-size:1rem;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:.5rem">Historia meczów ('+allTm.length+')</div>'
        +filterBar
        +'<div id="tmf-table-wrap"></div>'
        +'</div>';
    })();
  try { document.getElementById('team-modal-content').insertAdjacentHTML('beforeend', _advTeamHtml(tn)); } catch(e) { console.warn('adv team', e); }
  try { document.getElementById('team-modal-content').insertAdjacentHTML('beforeend', `<div style="text-align:center;margin:1rem 0 .3rem"><button class="btn btn-ghost" onclick="shareLink('t', this.dataset.n, this.dataset.n)" data-n="${_h(tn)}">🔗 Udostępnij drużynę</button></div>`); } catch(e) {}
  document.getElementById('team-modal').classList.add('open');
  var _tsb = document.getElementById('team-share-btn');
  if(_tsb) { _tsb.onclick = function(){ shareTeamCard(tn); }; }
  // Render match history table after DOM is ready
  setTimeout(renderTeamMatchHistory, 50);
}
function getRoundForMatch(m) {
  if (!m.date) return null;
  return rounds.find(function(r){ return r.from && r.to && m.date >= r.from && m.date <= r.to; }) || null;
}

function renderTeamMatchHistory() {
  var tn = window._teamModalName;
  var allTm = window._teamModalMatches || [];
  if (!tn || !allTm.length) return;

  var selSeason = (document.getElementById('tmf-season')||{}).value || '';
  var selRound  = (document.getElementById('tmf-round') ||{}).value || '';
  var selResult = (document.getElementById('tmf-result')||{}).value || '';

  var filtered = allTm.filter(function(m) {
    if (selSeason && m.seasonId !== selSeason) return false;
    if (selRound) {
      // Find the selected round object, then check match date falls within its range
      var selRoundObj = rounds.find(function(r){ return r.id == selRound; });
      if (!selRoundObj) return false;
      if (!(m.date >= selRoundObj.from && m.date <= selRoundObj.to)) return false;
    }
    if (selResult) {
      var isT1 = m.team1.name === tn;
      var myS  = isT1 ? m.team1.score : m.team2.score;
      var oppS = isT1 ? m.team2.score : m.team1.score;
      var win  = myS > oppS;
      if (selResult === 'W' && !win) return false;
      if (selResult === 'L' &&  win) return false;
    }
    return true;
  });

  var countEl = document.getElementById('tmf-count');
  if (countEl) countEl.textContent = filtered.length + ' meczów';

  var mrows = filtered.map(function(m) {
    var isT1 = m.team1.name === tn;
    var myScore  = isT1 ? m.team1.score : m.team2.score;
    var oppScore = isT1 ? m.team2.score : m.team1.score;
    var opp = isT1 ? m.team2.name : m.team1.name;
    var win = myScore > oppScore;
    var isWO = m.walkover === true;
    var sn  = seasons.find(function(s){ return s.id === m.seasonId; });
    var rn  = getRoundForMatch(m);
    // W/L label — add WO badge if walkover
    var wlHtml = '<span style="font-weight:700;color:'+(win?'var(--win)':'var(--loss)')+'">'+( win?'W':'L')+'</span>'
      + (isWO ? ' <span style="font-size:.65rem;font-weight:700;background:rgba(156,163,175,.2);color:var(--muted);border-radius:3px;padding:.1rem .3rem;margin-left:.2rem">WO</span>' : '');
    // Score — WO in muted style
    var scoreHtml = isWO
      ? '<span style="color:var(--muted);font-size:.8rem">'+myScore+'-'+oppScore+'</span> <span style="font-size:.65rem;color:var(--muted)">(walkover)</span>'
      : '<span style="font-weight:700;color:'+(win?'var(--win)':'var(--loss)')+'">'+myScore+'-'+oppScore+'</span>';
    return '<tr style="cursor:pointer" onclick="closeTeamModal();setTimeout(function(){openMatch('+m.id+');},200)">'
      +'<td style="color:var(--muted);font-size:.8rem;white-space:nowrap">'+formatDate(m.date)+'</td>'
      +'<td>'+wlHtml+'</td>'
      +'<td style="font-size:.85rem"><div style="display:flex;align-items:center;gap:.4rem">'+teamLogo(opp,20,'.55rem')+'<span>vs '+opp+'</span></div></td>'
      +'<td>'+scoreHtml+'</td>'
      +'<td style="font-size:.75rem;color:var(--muted)">'+(sn?sn.name:'—')+'</td>'
      +'<td style="font-size:.75rem;color:var(--muted)">'+(rn?rn.label:'—')+'</td>'
      +'</tr>';
  }).join('');

  var wrap = document.getElementById('tmf-table-wrap');
  if (!wrap) return;
  if (!mrows) {
    wrap.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:.5rem 0">Brak meczów dla wybranych filtrów.</p>';
    return;
  }
  wrap.innerHTML = '<div class="stats-table-wrap"><table><thead><tr>'
    +'<th style="text-align:left">Data</th><th>W/L</th><th style="text-align:left">Rywal</th>'
    +'<th>Wynik</th><th>Sezon</th><th>Kolejka</th>'
    +'</tr></thead><tbody>'+mrows+'</tbody></table></div>';
}


// ═══════════════════════════════════════════════════════════════
// PLAYOFF MATCH INTEGRATION
// ═══════════════════════════════════════════════════════════════

// Get the active playoff object
function getActivePlayoff() {
  _migratePlayoffSeasons();
  if(currentSeasonId && seasons.some(x => x.id === currentSeasonId))
    return [...playoffs].reverse().find(p => p.seasonId === currentSeasonId) || null;
  return playoffs.length ? playoffs[playoffs.length - 1] : null;
}

// Starsze playoffy bez seasonId: przypisz sezon na podstawie ich pierwszych meczów
function _migratePlayoffSeasons() {
  playoffs.forEach(po => {
    if(po.seasonId || !po.rounds) return;
    const keys = new Set(po.rounds.flatMap(r => r.pairs.map(p => [p.team1, p.team2].sort().join('|'))));
    const cutoff = _poCutoff(po);
    const first = matches.filter(m => m.seasonId && m.date >= cutoff && keys.has([m.team1.name, m.team2.name].sort().join('|')))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))[0];
    if(first) po.seasonId = first.seasonId;
  });
}

// Get all matches that belong to playoffs (after startDate)


function getWinsNeeded(format) {
  return { bo1:1, bo3:2, bo5:3, bo7:4 }[format] || 3;
}

function _poCutoff(po) { return po.startDate || (po.createdAt || '').slice(0, 10) || '0000-00-00'; }
function _poSeasonOk(po, m) { return !po.seasonId || !m.seasonId || po.seasonId === m.seasonId; }
function _isAnyPlayoffMatch(m) {
  const key = [m.team1?.name, m.team2?.name].sort().join('|');
  return playoffs.some(po => _poSeasonOk(po, m) && m.date >= _poCutoff(po) &&
    (po.rounds || []).some(r => r.pairs.some(p => [p.team1, p.team2].sort().join('|') === key)));
}

function getPlayoffMatches(po) {
  if (!po) return [];
  const poPairs = new Set(
    po.rounds.flatMap(r => r.pairs.map(p => [p.team1, p.team2].sort().join('|')))
  );
  // startDate fallback: use createdAt date portion, or accept all pair matches if neither exists
  const cutoff = po.startDate || (po.createdAt || '').slice(0,10) || '0000-00-00';
  return matches.filter(m =>
    poPairs.has([m.team1.name, m.team2.name].sort().join('|')) && m.date >= cutoff && _poSeasonOk(po, m)
  );
}

// Get series results between two teams in a playoff
function getSeriesResults(po, team1, team2) {
  const poMatches = getPlayoffMatches(po);
  const series = poMatches.filter(m => {
    const names = [m.team1?.name, m.team2?.name];
    return names.includes(team1) && names.includes(team2);
  }).sort((a,b) => new Date(a.date) - new Date(b.date));

  let w1 = 0, w2 = 0;
  const games = series.map((m, gi) => {
    const isT1 = m.team1.name === team1;
    const s1 = isT1 ? m.team1.score : m.team2.score;
    const s2 = isT1 ? m.team2.score : m.team1.score;
    const win1 = s1 > s2;
    if (win1) w1++; else w2++;
    return { matchId: m.id, date: m.date, s1, s2, win1, gameNum: gi + 1 };
  });

  return { w1, w2, games };
}

function syncPlayoffBracket() {
  const po = getActivePlayoff();
  if (!po || !po.startDate) return;

  const wn = getWinsNeeded(po.format);
  let changed = false;

  po.rounds.forEach(round => {
    round.pairs.forEach(pair => {
      const series = getSeriesResults(po, pair.team1, pair.team2);
      if (series.w1 !== pair.w1 || series.w2 !== pair.w2) {
        pair.w1 = series.w1;
        pair.w2 = series.w2;
        changed = true;
      }
    });
  });

  if (changed) {
    saveData();
    renderPlayoffDashboard();
  }
}

function getPlayoffStats(){return __lz(10,'getPlayoffStats',this,arguments)}

function closeTeamModal(){return __lz(10,'closeTeamModal',this,arguments)}
openTeamModal._openPlayer=function(pn,tn){
  var games=[];
  matches.forEach(function(m){[m.team1,m.team2].forEach(function(t){
    if(t.name!==tn)return;
    var p=(t.players||[]).find(function(x){return x.name===pn;});
    if(!p)return;
    var opp=t===m.team1?m.team2:m.team1;
    games.push({date:m.date,opp:opp.name,pts:p.pts||0,reb:p.reb||0,ast:p.ast||0,stl:p.stl||0,blk:p.blk||0,to:p.to||0,fgm:p.fgm||0,fga:p.fga||0,tpm:p.tpm||0,tpa:p.tpa||0,ftm:p.ftm||0,fta:p.fta||0,grade:p.grade||'B'});
  });});
  if(!games.length)return;
  var gp=games.length,sum=function(k){return games.reduce(function(s,g){return s+(g[k]||0);},0);};
  var avg=function(k){return(sum(k)/gp).toFixed(1);};
  var ag=numToGrade(games.reduce(function(s,g){return s+gradeToNum(g.grade);},0)/gp);
  var boxes=[['GRD','<span class="grade grade-'+ag.replace('+','p').replace('-','m')+'">'+ag+'</span>'],
    ['PTS',avg('pts')],['REB',avg('reb')],['AST',avg('ast')],['STL',avg('stl')],['BLK',avg('blk')],['TO',avg('to')],
    ['FG%',sum('fga')>0?Math.round(sum('fgm')/sum('fga')*100)+'%':'0%'],
    ['3P%',sum('tpa')>0?Math.round(sum('tpm')/sum('tpa')*100)+'%':'0%'],
    ['FT%',sum('fta')>0?Math.round(sum('ftm')/sum('fta')*100)+'%':'0%']
  ].map(function(s){return '<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:0.75rem;text-align:center"><div style="font-size:0.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:0.25rem">'+s[0]+'</div><div style="font-family:Barlow Condensed,sans-serif;font-weight:900;font-size:1.5rem;color:var(--accent)">'+s[1]+'</div></div>';}).join('');
  var rows=games.slice().sort(function(a,b){return new Date(b.date)-new Date(a.date);}).map(function(g){
    return '<tr><td>'+g.date+'</td><td style="color:var(--muted)">'+g.opp+'</td><td><span class="grade grade-'+g.grade.replace('+','p').replace('-','m')+'">'+g.grade+'</span></td>'
      +'<td>'+g.pts+'</td><td>'+g.reb+'</td><td>'+g.ast+'</td><td>'+g.stl+'</td><td>'+g.blk+'</td><td>'+g.to+'</td>'
      +'<td>'+g.fgm+'/'+g.fga+'</td><td>'+g.tpm+'/'+g.tpa+'</td><td>'+g.ftm+'/'+g.fta+'</td></tr>';
  }).join('');
  document.getElementById('player-modal-content').innerHTML=
    '<div style="margin-bottom:1.5rem"><div style="font-family:Barlow Condensed,sans-serif;font-weight:900;font-size:2rem;letter-spacing:2px;text-transform:uppercase">'+pn+'</div>'
    +'<div style="color:var(--muted);font-size:0.9rem">'+tn+' &middot; '+gp+' meczy</div></div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(95px,1fr));gap:0.6rem;margin-bottom:1.5rem">'+boxes+'</div>'
    +'<div style="font-weight:700;font-size:1rem;text-transform:uppercase;margin-bottom:0.5rem;color:var(--muted)">Historia meczow</div>'
    +'<div class="stats-table-wrap"><table><thead><tr><th>Data</th><th>vs</th><th>GRD</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>TO</th><th>FG</th><th>3P</th><th>FT</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  document.getElementById('player-modal').classList.add('open');
};

function openComparatorModal(){return __lz(10,'openComparatorModal',this,arguments)}
function _openComparatorModalOld(){return __lz(10,'_openComparatorModalOld',this,arguments)}
function renderCmp(){return __lz(10,'renderCmp',this,arguments)}

function _cmpRadar(){return __lz(10,'_cmpRadar',this,arguments)}

function openSeasonModal(){return __lz(10,'openSeasonModal',this,arguments)}

function renderSeasonModal(){return __lz(10,'renderSeasonModal',this,arguments)}

function renameSeason(){return __lz(10,'renameSeason',this,arguments)}
function promptNewSeason(){return __lz(10,'promptNewSeason',this,arguments)}

function createSeason(){return __lz(10,'createSeason',this,arguments)}

function activateSeason(){return __lz(10,'activateSeason',this,arguments)}

function endCurrentSeason(){return __lz(10,'endCurrentSeason',this,arguments)}


function mergeSeasons(){return __lz(10,'mergeSeasons',this,arguments)}

function renderMergeSeasons(){return __lz(10,'renderMergeSeasons',this,arguments)}

function deleteSeason(){return __lz(10,'deleteSeason',this,arguments)}

function updateSeasonBadge() {
  const el = document.getElementById('current-season-badge');
  if(!el) return;
  if(currentSeasonId) {
    const s = seasons.find(x => x.id === currentSeasonId);
    el.innerHTML = s ? `<span class="season-badge">${s.name}</span>` : '';
  } else {
    el.innerHTML = '';
  }
}


function toggleTheme(){return __lz(10,'toggleTheme',this,arguments)}
(function(){
  if(localStorage.getItem('nba2k_theme')==='light'){
    document.body.classList.add('light');
    const btn=document.getElementById('theme-btn');
    if(btn) btn.textContent='🌙';
  }
})();

function openPlayerCard(){return __lz(10,'openPlayerCard',this,arguments)}

function openRivalryModal(){return __lz(10,'openRivalryModal',this,arguments)}

let editingMatchId = null;

function editMatch(){return __lz(10,'editMatch',this,arguments)}

function editMatchPlayer(){return __lz(10,'editMatchPlayer',this,arguments)}

function editMatchStat(){return __lz(10,'editMatchStat',this,arguments)}

function editMatchGrade(){return __lz(10,'editMatchGrade',this,arguments)}

const _origSaveMatchEdit = saveMatch;
saveMatch = function() {
  if(editingMatchId!==null){
    if(!pendingMatch)return;
    pendingMatch.date=document.getElementById('match-date').value||pendingMatch.date;
    pendingMatch.note=document.getElementById('match-note').value;
    const idx=matches.findIndex(x=>Number(x.id)===editingMatchId);
    if(idx!==-1)matches[idx]={...matches[idx],...pendingMatch,id:editingMatchId};
    editingMatchId=null;
    saveData().then(()=>showToast('✅ Mecz zaktualizowany!','success'));
    clearForm();
    document.getElementById('parsed-result').style.display='none';
    pendingMatch=null;
    const btn=document.querySelector('[onclick="saveMatch()"]');
    if(btn)btn.innerHTML='✅ Zapisz Mecz';
    setTimeout(()=>showView('matches'),1200);
    return;
  }
  _origSaveMatchEdit();
};


function savePlayerPositionFromSelect(){return __lz(10,'savePlayerPositionFromSelect',this,arguments)}

function savePlayerPosition(){return __lz(10,'savePlayerPosition',this,arguments)}


function setRecapModel(){return __lz(10,'setRecapModel',this,arguments)}

function renderRecapBlock(text, matchId) {
  var shareBtn = matchId ? '<button onclick="shareMatch(' + matchId + ')" title="Udostępnij" style="display:inline-flex;align-items:center;justify-content:center;background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:8px;width:34px;height:34px;cursor:pointer;flex-shrink:0;transition:all .2s" onmouseover="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--muted)\'">&#x1F4E4;</button>' : '';
  return '<div style="margin-top:1.25rem;padding:1rem 1.25rem;background:rgba(245,197,24,0.05);border:1px solid rgba(245,197,24,0.2);border-radius:10px">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-bottom:.6rem;flex-wrap:wrap">'
    + '<div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:.85rem;letter-spacing:1px;text-transform:uppercase;color:var(--accent)">📝 Recap meczu</div>'
    + shareBtn + '</div>'
    + '<div style="font-size:.9rem;line-height:1.65;color:var(--text);white-space:pre-line">' + text + '</div>'
    + '</div>';
}

function shareMatch(){return __lz(10,'shareMatch',this,arguments)}

function generateMatchCard(){return __lz(10,'generateMatchCard',this,arguments)}


function sharePlayerCard(){return __lz(10,'sharePlayerCard',this,arguments)}


function shareStandings(){return __lz(10,'shareStandings',this,arguments)}

function shareTeamCard(){return __lz(10,'shareTeamCard',this,arguments)}

function generateRecap(){return __lz(10,'generateRecap',this,arguments)}


function calcDefScore(){return __lz(10,'calcDefScore',this,arguments)}

function buildDefFive(){return __lz(10,'buildDefFive',this,arguments)}

function renderFiveGrid(){return __lz(10,'renderFiveGrid',this,arguments)}

function renderSecondFive(){return __lz(10,'renderSecondFive',this,arguments)}

let _rdActiveRound = 0;

function openRoundsDetailModal(){return __lz(10,'openRoundsDetailModal',this,arguments)}

function rdSelectRound(){return __lz(10,'rdSelectRound',this,arguments)}

function rdRenderContent(){return __lz(10,'rdRenderContent',this,arguments)}



function sendMatchWebhook(){return __lz(10,'sendMatchWebhook',this,arguments)}


function openRoutesModal(){return __lz(10,'openRoutesModal',this,arguments)}
function _evoStatus(){return __lz(10,'_evoStatus',this,arguments)}
function onbLoad(){return __lz(10,'onbLoad',this,arguments)}
function onbSave(){return __lz(10,'onbSave',this,arguments)}
function teamRolesSync(){return __lz(10,'teamRolesSync',this,arguments)}
function teamEmojis(){return __lz(10,'teamEmojis',this,arguments)}
function routesSave(){return __lz(10,'routesSave',this,arguments)}
function routeTest(){return __lz(10,'routeTest',this,arguments)}

function sendEventWebhook(){return __lz(10,'sendEventWebhook',this,arguments)}

function _discordNotify(){return __lz(10,'_discordNotify',this,arguments)}

function openCaptainNotifModal(){return __lz(11,'openCaptainNotifModal',this,arguments)}

function sendCaptainNotifWebhook(){return __lz(11,'sendCaptainNotifWebhook',this,arguments)}

function copyCaptainNotifText(){return __lz(11,'copyCaptainNotifText',this,arguments)}
function openPlayerH2H(){return __lz(11,'openPlayerH2H',this,arguments)}

function renderPlayerH2H(){return __lz(11,'renderPlayerH2H',this,arguments)}

function openRosterCalculator(){return __lz(11,'openRosterCalculator',this,arguments)}

function rcLoadTeam(){return __lz(11,'rcLoadTeam',this,arguments)}

function rcClearAll(){return __lz(11,'rcClearAll',this,arguments)}

function rcValidateDupes(changedIdx) {
  const vals = ['PG','SG','SF','PF','C'].map((_,i) => document.getElementById('rc-slot-'+i)?.value || '');
  const changedVal = vals[changedIdx];
  if(changedVal) {
    vals.forEach((v, i) => {
      if(i !== changedIdx && v === changedVal) {
        const sel = document.getElementById('rc-slot-'+i);
        if(sel) sel.value = '';
        showToast('⚠️ Ten gracz jest już wybrany na innej pozycji', 'info');
      }
    });
  }
  calcRoster();
}

function setRosterMetric(){return __lz(11,'setRosterMetric',this,arguments)}

function calcRoster(){return __lz(11,'calcRoster',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// PUBLICZNY LINK DO EVENTU
// ═══════════════════════════════════════════════════════════════
function getEventPublicUrl(eventId) {
  const base = window.location.href.split('?')[0].split('#')[0];
  return base + '?event=' + encodeURIComponent(eventId);
}

function copyEventLink(eventId) {
  const url = getEventPublicUrl(eventId);
  navigator.clipboard.writeText(url).then(() => {
    showToast('🔗 Link skopiowany!', 'success');
  }).catch(() => {
    prompt('Skopiuj link:', url);
  });
}

// After Discord OAuth return — open pending event signup
function checkPendingSignupEvent() {
  if(!discordUser) return; // only if just logged in
  const pendingId = localStorage.getItem('nba2k_pending_signup_event');
  if(!pendingId) return;
  localStorage.removeItem('nba2k_pending_signup_event');
  // Wait for events to load then open the event + trigger signup flow
  const tryOpen = (attempts) => {
    const ev = events.find(e => e.id === pendingId);
    if(ev) {
      showView('events');
      setTimeout(() => {
        openEventDetail(pendingId);
        // Auto-trigger signup (position picker for draft, direct for others)
        setTimeout(() => {
          if(ev.type === 'draft' && ev.status === 'open') {
            openPositionPickerModal(pendingId);
          }
          // For non-draft events user can click button themselves — event detail is already open
        }, 400);
      }, 300);
    } else if(attempts > 0) {
      setTimeout(() => tryOpen(attempts - 1), 400);
    }
  };
  setTimeout(() => tryOpen(10), 600);

  // Also handle pending GM panel intent (set when user wasn't logged in and clicked GM link)
  const pendingGmId = localStorage.getItem('nba2k_pending_gm_event');
  if(pendingGmId) {
    localStorage.removeItem('nba2k_pending_gm_event');
    const tryGm = (attempts) => {
      const ev = events.find(e => e.id === pendingGmId);
      if(!ev) { if(attempts > 0) { setTimeout(() => tryGm(attempts - 1), 500); } return; }
      const isCaptain = (ev.teams||[]).some(t => t.captain?.id === discordUser?.id);
      if(!isCaptain && attempts > 0) { setTimeout(() => tryGm(attempts - 1), 500); return; }
      if(!isCaptain) { showToast('⚠️ Nie jesteś przypisany jako kapitan w tym drafcie', 'warning'); return; }
      showView('events');
      setTimeout(() => openGMPanel(pendingGmId), 300);
    };
    setTimeout(() => tryGm(10), 600);
  }
}

// Check on load if URL has ?event= param and open it; handle #gm / #board hashes
function checkEventUrlParam() {
  const params = new URLSearchParams(window.location.search);
  const evId = params.get('event');
  if(!evId) return;
  const hash = window.location.hash;

  if(hash === '#gm') {
    // GM panel link — requires Discord login
    window.history.replaceState({}, '', window.location.pathname);

    if(!discordUser) {
      // Not logged in — store intent and redirect to Discord OAuth.
      // Return URL MUST be bare (no ? or # params) because the Worker does string
      // concatenation: return_url + '?discord_user=TOKEN', so any existing ? or #
      // in return_url breaks the resulting URL. State is preserved via localStorage.
      localStorage.setItem('nba2k_pending_gm_event', evId);
      if(workerUrl) {
        const returnUrl = `${location.origin}${location.pathname}`;
        window.location.href = workerUrl.replace(/\/$/, '') + '/discord-login?return=' + encodeURIComponent(returnUrl);
      } else {
        showView('events');
        showToast('⚠️ Zaloguj się przez Discord aby otworzyć Panel GM', 'warning');
      }
      return;
    }

    // Already logged in — show the page immediately while retrying captain check
    showView('events');
    const tryOpenGM = (attempts) => {
      const ev = events.find(e => e.id === evId);
      if(!ev) {
        if(attempts > 0) { setTimeout(() => tryOpenGM(attempts - 1), 500); return; }
        showToast('❌ Nie znaleziono eventu draftu', 'error');
        return;
      }
      // Also wait if ev.teams has no captains yet (KV propagation lag after _dsNotify)
      const isCaptain = (ev.teams||[]).some(t => t.captain?.id === discordUser?.id);
      if(!isCaptain && attempts > 0) { setTimeout(() => tryOpenGM(attempts - 1), 500); return; }
      setTimeout(() => openGMPanel(evId), 300);
    };
    setTimeout(() => tryOpenGM(10), 600);

  } else if(hash === '#board') {
    // Board (spectator draft view) — no login required
    window.history.replaceState({}, '', window.location.pathname);
    const tryOpenBoard = (attempts) => {
      const ev = events.find(e => e.id === evId);
      if(ev && ['draft','active','closed'].includes(ev.status)) {
        openDraftView(evId);
      } else if(attempts > 0) {
        setTimeout(() => tryOpenBoard(attempts - 1), 500);
      } else {
        showView('events');
        showToast('ℹ️ Draft nie jest aktywny', 'info');
      }
    };
    showView('events');
    setTimeout(() => tryOpenBoard(10), 600);

  } else {
    // Default: open event detail
    setTimeout(() => {
      showView('events');
      setTimeout(() => openEventDetail(evId), 300);
    }, 500);
  }
}


function openLeagueRecordsModal(){return __lz(11,'openLeagueRecordsModal',this,arguments)}

function renderTopGamesSection(){return __lz(11,'renderTopGamesSection',this,arguments)}

function renderSeasonComparisonSection(){return __lz(11,'renderSeasonComparisonSection',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// MVP EVENTU
// ═══════════════════════════════════════════════════════════════
function getEventMVP(ev) {
  const evMatches = ev.matches || [];
  if(!evMatches.length) return null;
  const playerMap = {};
  evMatches.forEach(m => {
    [m.team1, m.team2].forEach((team, ti) => {
      (team.players||[]).forEach((p, idx) => {
        const POSITIONS = ['PG','SG','SF','PF','C'];
        const pos = p.pos || POSITIONS[idx] || 'PG';
        if(!playerMap[p.name]) playerMap[p.name] = {name:p.name,team:team.name,pos,gp:0,pts:0,reb:0,ast:0,stl:0,blk:0,to:0,fgm:0,fga:0,gradeSum:0,ftm:0,fta:0};
        const s = playerMap[p.name];
        s.gp++; s.pts+=p.pts||0; s.reb+=p.reb||0; s.ast+=p.ast||0;
        s.stl+=p.stl||0; s.blk+=p.blk||0; s.to+=p.to||0;
        s.fgm+=p.fgm||0; s.fga+=p.fga||0; s.gradeSum+=gradeToNum(p.grade||'B');
        s.ftm+=p.ftm||0; s.fta+=p.fta||0;
      });
    });
  });
  const players = Object.values(playerMap).filter(p => p.gp > 0).map(p => ({
    ...p, cs: calcCompositeScore(p), per: calcPER(p)
  }));
  if(!players.length) return null;
  return players.sort((a,b) => b.cs - a.cs)[0];
}

function renderEventMVPBadge(ev) {
  const mvp = getEventMVP(ev);
  if(!mvp) return '';
  const gr = numToGrade(mvp.gradeSum/mvp.gp);
  const avg = k => (mvp[k]/mvp.gp).toFixed(1);
  return `
    <div style="background:linear-gradient(135deg,rgba(245,197,24,.12),rgba(245,197,24,.04));border:1px solid rgba(245,197,24,.35);border-radius:10px;padding:.9rem 1rem;margin-bottom:1rem">
      <div style="font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--accent);margin-bottom:.4rem">🏆 MVP EVENTU</div>
      <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
        <div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem">${mvp.name}</div>
          <div style="font-size:.78rem;color:var(--muted)">${mvp.team}</div>
        </div>
        <span class="grade grade-${gr.replace('+','p').replace('-','m')}">${gr}</span>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.2rem;color:var(--accent)">CS ${mvp.cs.toFixed(1)}</div>
        <div style="font-size:.8rem;color:var(--muted)">${avg('pts')} PTS · ${avg('reb')} REB · ${avg('ast')} AST · ${mvp.gp} meczów</div>
      </div>
    </div>`;
}

function openEventArchiveModal(){return __lz(11,'openEventArchiveModal',this,arguments)}

function initEventBracket(){return __lz(11,'initEventBracket',this,arguments)}

function renderEventBracket(ev) {
  const isAdmin = _isLoggedInSync();
  const bracket = ev.bracket;
  if(!bracket || !bracket.rounds || !bracket.rounds.length) {
    return `<div style="color:var(--muted);text-align:center;padding:2rem">
      Brak drabinki.
      ${isAdmin && (ev.teams||[]).length >= 2 ? `<div style="margin-top:1rem"><button onclick="initEventBracket('${ev.id}')" class="btn btn-primary">🎲 Utwórz drabinkę</button></div>` : ''}
    </div>`;
  }

  const roundNames = ['Runda 1','Ćwierćfinały','Półfinały','Finał'];
  const totalRounds = bracket.rounds.length;

  const roundsHtml = bracket.rounds.map((round, ri) => {
    const roundName = roundNames[totalRounds - 1 - (totalRounds - 1 - ri)] || ('Runda ' + (ri+1));
    const matchesHtml = round.map((match, mi) => {
      if(!match.team1 && !match.team2) return '';
      const bye = !match.team2;
      const w1 = match.winner === match.team1;
      const w2 = match.winner === match.team2;
      return `
        <div style="background:var(--surface2);border:1px solid ${match.winner?'var(--border)':'var(--border)'};border-radius:8px;overflow:hidden;width:180px;margin-bottom:.5rem">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:.4rem .6rem;background:${w1?'rgba(245,197,24,.12)':'transparent'};border-bottom:1px solid var(--border)">
            <span style="font-weight:${w1?'700':'400'};font-size:.85rem;color:${w1?'var(--accent)':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px">${match.team1||'—'}</span>
            ${isAdmin && match.team1 && match.team2 && !match.winner ? `<input type="number" min="0" max="999" placeholder="0" id="bs1-${ri}-${mi}" style="width:36px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.1rem .3rem;font-size:.8rem;text-align:center;font-family:inherit">` : `<span style="font-weight:700;color:${w1?'var(--accent)':'var(--text)'};min-width:1.5rem;text-align:right">${match.score1 !== null ? match.score1 : ''}</span>`}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:.4rem .6rem;background:${w2?'rgba(245,197,24,.12)':'transparent'}">
            <span style="font-weight:${w2?'700':'400'};font-size:.85rem;color:${bye?'var(--muted)':w2?'var(--accent)':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px">${match.team2 || (bye ? 'BYE' : '—')}</span>
            ${isAdmin && match.team1 && match.team2 && !match.winner ? `<input type="number" min="0" max="999" placeholder="0" id="bs2-${ri}-${mi}" style="width:36px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.1rem .3rem;font-size:.8rem;text-align:center;font-family:inherit">` : `<span style="font-weight:700;color:${w2?'var(--accent)':'var(--text)'};min-width:1.5rem;text-align:right">${match.score2 !== null ? match.score2 : ''}</span>`}
          </div>
          ${isAdmin && match.team1 && match.team2 && !match.winner ? `<div style="padding:.3rem .6rem;border-top:1px solid var(--border)"><button onclick="saveBracketMatch('${ev.id}',${ri},${mi})" style="width:100%;background:var(--accent);border:none;color:#000;border-radius:4px;padding:.2rem;font-size:.72rem;font-weight:700;cursor:pointer;font-family:inherit">✅ Zapisz wynik</button></div>` : ''}
          ${match.winner ? `<div style="padding:.2rem .6rem;background:rgba(46,204,113,.08);border-top:1px solid var(--border);font-size:.7rem;color:var(--win);font-weight:700">✓ ${match.winner}</div>` : ''}
        </div>`;
    }).join('');

    return `<div style="flex-shrink:0">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.6rem;text-align:center">${roundName}</div>
      <div style="display:flex;flex-direction:column;justify-content:space-around;gap:.5rem">${matchesHtml}</div>
    </div>`;
  }).join('<div style="display:flex;align-items:center;padding:0 .5rem;color:var(--border);font-size:1.5rem">›</div>');

  const champion = bracket.champion ? `
    <div style="text-align:center;padding:1.25rem;background:linear-gradient(135deg,rgba(245,197,24,.15),rgba(245,197,24,.05));border:2px solid rgba(245,197,24,.4);border-radius:12px;margin-top:1rem">
      <div style="font-size:2rem;margin-bottom:.25rem">🏆</div>
      <div style="font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px">Mistrz</div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem;color:var(--accent)">${bracket.champion}</div>
    </div>` : '';

  return `
    <div style="overflow-x:auto;padding-bottom:.5rem">
      <div style="display:flex;align-items:flex-start;gap:.25rem;min-width:max-content;padding:.5rem 0">${roundsHtml}</div>
    </div>
    ${champion}
    ${isAdmin ? `<div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border)"><button onclick="initEventBracket('${ev.id}')" class="btn btn-ghost" style="font-size:.82rem">🔄 Resetuj drabinkę</button></div>` : ''}`;
}

function saveBracketMatch(){return __lz(11,'saveBracketMatch',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// FAZY EVENTU
// ═══════════════════════════════════════════════════════════════
function renderEventPhases(ev) {
  const isAdmin = _isLoggedInSync();
  const phases = ev.phases || [];

  if(!phases.length && !isAdmin) {
    return '<div style="color:var(--muted);text-align:center;padding:2rem">Brak faz eventu</div>';
  }

  const phaseCards = phases.map((phase, pi) => {
    const phaseMatches = (ev.matches||[]).filter(m => m.phase === pi);
    // Mini standings per phase
    const teamW = {}, teamL = {};
    phaseMatches.forEach(m => {
      const w = (m.team1?.score||0) > (m.team2?.score||0) ? m.team1?.name : m.team2?.name;
      const l = w === m.team1?.name ? m.team2?.name : m.team1?.name;
      teamW[w] = (teamW[w]||0) + 1;
      teamL[l] = (teamL[l]||0) + 1;
    });
    const teams = [...new Set([...Object.keys(teamW), ...Object.keys(teamL)])];
    const standings = teams.map(t => ({ name:t, w:teamW[t]||0, l:teamL[t]||0 })).sort((a,b)=>b.w-a.w||a.l-b.l);

    return `
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1rem;margin-bottom:.75rem">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.75rem;flex-wrap:wrap">
          <div>
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.1rem;letter-spacing:1px">${phase.name}</div>
            <div style="font-size:.78rem;color:var(--muted)">${phaseMatches.length} meczów</div>
          </div>
          ${isAdmin ? `<button onclick="setCurrentPhase('${ev.id}',${pi})" style="background:${ev.currentPhase===pi?'var(--accent)':'var(--surface)'};color:${ev.currentPhase===pi?'#000':'var(--muted)'};border:1px solid ${ev.currentPhase===pi?'var(--accent)':'var(--border)'};border-radius:6px;padding:.25rem .75rem;font-size:.78rem;cursor:pointer;font-family:inherit;font-weight:${ev.currentPhase===pi?'700':'400'}">${ev.currentPhase===pi?'✅ Aktywna':'Ustaw aktywną'}</button>` : ''}
        </div>
        ${standings.length ? `
          <div style="display:flex;gap:1rem;flex-wrap:wrap">
            ${standings.map(t=>`<div style="font-size:.82rem"><span style="font-weight:700">${t.name}</span> <span style="color:var(--win)">${t.w}W</span>-<span style="color:var(--loss)">${t.l}L</span></div>`).join('')}
          </div>` : '<div style="font-size:.8rem;color:var(--muted)">Brak meczów w tej fazie</div>'}
      </div>`;
  }).join('');

  const addPhaseHtml = isAdmin ? `
    <div style="border-top:1px solid var(--border);padding-top:1rem;margin-top:.5rem">
      <div style="font-size:.8rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:.5rem">Dodaj fazę</div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        ${['Faza grupowa','Półfinały','Finał','Runda eliminacyjna'].map(name =>
          `<button onclick="addEventPhase('${ev.id}','${name}')" style="background:var(--surface);border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:.3rem .7rem;font-size:.8rem;cursor:pointer;font-family:inherit;transition:border-color .2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">${name}</button>`
        ).join('')}
        <input id="custom-phase-name" type="text" placeholder="Własna nazwa..." style="flex:1;min-width:120px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .6rem;font-size:.8rem;font-family:inherit">
        <button onclick="addEventPhase('${ev.id}',document.getElementById('custom-phase-name').value)" class="btn btn-primary" style="font-size:.8rem;padding:.3rem .7rem">+ Dodaj</button>
      </div>
    </div>` : '';

  return phaseCards + addPhaseHtml;
}

function addEventPhase(){return __lz(11,'addEventPhase',this,arguments)}

function setCurrentPhase(){return __lz(11,'setCurrentPhase',this,arguments)}



function callGemini(){return __lz(11,'callGemini',this,arguments)}

function callAI(){return __lz(11,'callAI',this,arguments)}

function robustJsonParse(){return __lz(11,'robustJsonParse',this,arguments)}

function renameTeam(){return __lz(11,'renameTeam',this,arguments)}

function updateModelRadioStyles(){return __lz(11,'updateModelRadioStyles',this,arguments)}

function rcValidateDupes(changedIdx) {
  const vals = ['PG','SG','SF','PF','C'].map(function(_,i) {
    return document.getElementById('rc-slot-'+i)?.value || '';
  });
  const changedVal = vals[changedIdx];
  if(changedVal) {
    vals.forEach(function(v, i) {
      if(i !== changedIdx && v === changedVal) {
        const sel = document.getElementById('rc-slot-'+i);
        if(sel) sel.value = '';
        showToast('Ten gracz jest już wybrany na innej pozycji', 'info');
      }
    });
  }
  calcRoster();
}
async function deleteTeam(teamName) {
  // Check if team has any matches
  const hasMatches = matches.some(m => m.team1.name === teamName || m.team2.name === teamName);
  if(hasMatches) {
    showToast('❌ Nie można usunąć drużyny — ma zapisane mecze!', 'error');
    return;
  }
  if(!confirm('Usunąć drużynę "' + teamName + '"?')) return;
  if(teams[teamName]) delete teams[teamName];
  // Remove from schedule
  schedule = (schedule||[]).filter(s => s.team1 !== teamName && s.team2 !== teamName);
  // Remove aliases pointing to this team
  Object.keys(aliases).forEach(k => { if(aliases[k] === teamName) delete aliases[k]; });
  window.teams = teams;
  await saveData();
  renderTeamsList();
  showToast('✅ Drużyna usunięta: ' + teamName, 'success');
}

