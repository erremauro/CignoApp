# CignoApp

Estensione della Wiki di [https://www.cigno.app](cigno.app) che integra script e stylesheet customizzati per la piattaforma.

## Installazione

L'estensione segue i branch di riferimento di MediaWiki, così il branch per la versione 1.42.x si chiamera REL1_42 e così via.

Per installare eseguire il comando da console

```bash
git clone -b <BRANCH> https://github.com/erremauro/CignoApp.git
```

## Canzone

È possibile fare color-coding di tablature usando il codice di markup:

```html
<div class="song">
  <div class="chords">
  	  ...
  </div>
  <div class="song-content">
  	 ...
  </div>
</div>
```

### Tabella degli Accordi

all'interno dell'element `.chords` è possibile specificare la tabella degli accordi nel formato:

```
G    320200
G*   320000
C/G  332010
C    332200
```

**Nota**: il nome dell'accordo e la forma devono essere separati da almeno due spazi affinché il sistema li distingua.

### Contenuto della Canzone

La canzone viene automaticamente impaginata su due colonne laddove, all'interno di `.song-content` sia prensente il delimitatore `---`.

Per esempio:

```
         C/G         G*          D   (D*)
And the singing is slow and so quiet
          C/G             G*           D   (D*)
Like the sound when you sweep up the floor
           G                             C/G
And now something with the dirt is just different
            Am                 D      G
Since they shook the earth in 1904

 G(G*)  C(C*)  Am(Am*)   D(D*)              x2 

---

             Bm                     C*        (C/G)  
And when the night is young but the bridge is up
          Em                 C*  (C/G)  
Something passing by, I was sure
        Bm               C*      (C/G)
And the only one you can tell it to 
              Em                  D   (D*)
Well it's the only one that ever knows          
```