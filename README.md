# BicoccaDownloadTool

Progetto basato sul codice di Polidown https://github.com/sup3rgiu

## Possibilità 1: eseguibile

Basta scaricare il programma precompilato da questo link "----".
Nella cartella "eseguibile" sono presenti tutti i file necessari (nascosti) e non serve installare nient'altro.
Da terminale il comando da utilizzare è del tipo:
```
node bicoccadownloadtool.exe -u "m.rossi4" -v "http://...../index.php?=id=44292"
```

## Possibilità 2: codice sorgente

Scarica pure e modifica il codice, avrai bisogno di una serie di prerequisiti.

### Prerequisiti

* [**Node.js**](https://nodejs.org/it/download/)
* [**aria2**](https://github.com/aria2/aria2/releases): è necessario il file .exe sia in questa cartella (o nella `$PATH`)
* [**ffmpeg**](https://www.ffmpeg.org/download.html): è necessario il file .exe sia in questa cartella (o nella `$PATH`) (https://www.thewindowsclub.com/how-to-install-ffmpeg-on-windows-10).
* [**ChromeCanary**](https://www.google.com/intl/it/chrome/canary/thank-you.html?statcb=1&installdataindex=empty&defaultbrowser=0): è necessario inserire una cartella "bin" con tutti file di installazione.

### Installazione
* Scarica i 4 programmi necessari al funzionamento
* Scarica la cartella col codice sorgente
* Scarica (da riga di comando) tutti i modulo node.js necessari
```
npm install
```

## Utilizzo
* Apri il prompt dei comandi (cerca cmd su windows)
* Naviga fino a questa cartella (esempio: cd C:\Users\Admin\Desktop\BicoccaDownloadTool\)
* Esegui il comando necessario:(esempio: node bicoccadownloadtool.js -u "m.rossi4" -v "http://elearning.it/.../index.php?id=44292")
                               (esempio: node bicoccadownloadtool.exe -u "m.rossi4" -v "http://elearning.it/.../index.php?id=44292")
 **N.B**  se hai installato il programma da codice sorgente usa .js, altrimenti .exe


## Possibili problemi
* Tipologia di link: il link deve condurre precisamente a una pagina del tipo in figura.
* Titoli ripetuti: il programma nomina i file col titolo con cui è stato caricato su elearning, se più video hanno lo stesso nome verranno sovrascritti.
  Attenzione dunque: se non siete certi di quale sia il titolo forse è meglio scaricare un video per volta.
* Può darsi che non tutti i moduli siano installati correttamente, se vedi qualcosa tipo "puppeteer module not found" puoi provare a risolvere con
  "npm i puppeteer". In ogni caso google ha la risposta.
* Il programma è probabilmente pieno di bug. Se trovi qualcosa fammelo sapere!

![https://github.com/ruthwolves/bicoccadownloadtool/blob/main/images/videotype.png](https://github.com/ruthwolves/bicoccadownloadtool/blob/main/images/videotype.png)

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
In questo caso dovrai mettere i link dei video da scaricare in un file (default links.txt).

Esempio:
```

set codice_persona=m.rossi4
set urls_file_path="links.txt"

node bicoccadownloadtool.js -u %codice_persona% -f %urls_file_path%

@echo Press any key to terminate . . .
@pause >nul
```
