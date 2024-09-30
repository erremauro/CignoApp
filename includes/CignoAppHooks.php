<?php

class CignoAppHooks {
    public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin ) {
        // Carica il modulo di risorse definito in extension.json
        $out->addModules( 'ext.CignoApp' );
    }
}
