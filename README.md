# BicoccaDownloadTool

Progetto basato sul codice di Polidown https://github.com/sup3rgiu


## Prerequisiti

* [**Node.js**](https://nodejs.org/it/download/)
* [**aria2**](https://github.com/aria2/aria2/releases): è necessario il file .exe sia in questa cartella (o nella `$PATH`)
* [**ffmpeg**](https://www.ffmpeg.org/download.html): è necessario il file .exe sia in questa cartella (o nella `$PATH`) (https://www.thewindowsclub.com/how-to-install-ffmpeg-on-windows-10).

## Installazione
* Scarica i 3 programmi necessari al funzionamento
* Scarica la cartella
* Profits

## Utilizzo
* Apri il prompt dei comandi (cerca cmd su windows)
* Naviga fino a questa cartella (esempio: cd C:\Users\Admin\Desktop\BicoccaDownloadTool\)
* Esegui il comando necessario (esempio: node bicoccadownloadtool.js -u "m.rossi4" -v "http://elearning.it/.../index.php?id=44292")

## Possibili problemi
* Tipologia di link: il link deve condurre precisamente a una pagina del tipo in figura.
* Titoli ripetuti: il programma nomina i file col titolo con cui è stato caricato su elearning, se più video hanno lo stesso nome verranno sovrascritti.
  Attenzione dunque: se non siete certi di quale sia il titolo forse è meglio scaricare un video per volta.
* Può darsi che non tutti i moduli siano installati correttamente, se vedi qualcosa tipo "puppeteer modulo not found" puoi provare a risolvere con
  "npm i puppeteer". In ogni caso google ha la risposta.
* Il programma è probabilmente pieno di bug. Se trovi qualcosa fammelo sapere!

## Comandi

Utilizzo standard
```
$ node bicoccadownloadtool.js --username CODICEPERSONA --videoUrls "http://elearning.it/.../index.php?id=44292"

$ node bicoccadownloadtool.js -u CODICEPERSONA -v "http://elearning.it/.../index.php?id=44292"
```

Comando per visualizzare tutte le opzioni:
```
$ node bicoccadownloadtool.js -h

Options:
  --version              Show version number                           [boolean]
  -v, --videoUrls                                             [array] [required]
  -f, --videoUrlsFile    Path to txt file containing the URLs (one URL for each line) [string]
  -u, --username         Codice Persona PoliMi               [string] [required]
  -p, --password                                                        [string]
  -k, --noKeyring        Do not use system keyring    [boolean] [default: false]
  -t, --noToastNotification  Disable notifications    [boolean] [default: false]
  -h, --help             Show help                                     [boolean]
```

Download di più video:
```
$ node bicoccadownloadtool.js -u CODICEPERSONA
    -v "http://elearning.it/.../index.php?id=44292" "http://elearning.it/.../index.php?id=2341"

```
Da file di testo (un link per riga):
```
$ node bicoccadownloadtool.js -u CODICEPERSONA -f "links.txt"
```

Cambia la password salvata
```
$ node bicoccadownloadtool.js -u CODICEPERSONA -p MYNEWPASSWORD -v "http://elearning.it/.../index.php?id=44292"
```

Non salvare la password, verrà richiesta in automatico:
```
$ node bicoccadownloadtool.js -u CODICEPERSONA -v "http://elearning.it/.../index.php?id=44292" -k
```

## Utilizzo dello script

Apri con un qualsiasi editor (tipo il blocco note) il file "script.bat" e compilalo per evitare di scrivere ogni volta tutto d riga di comando.
In questo caso dovrai mettere i link dei video da scaricare in un file.

Esempio:
```

set codice_persona=m.rossi4
set urls_file_path="links.txt"

node bicoccadownloadtool.js -u %codice_persona% -f %urls_file_path%

@echo Press any key to terminate . . .
@pause >nul
```
