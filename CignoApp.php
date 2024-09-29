<?php
if (!defined('MEDIAWIKI')) {
    die('This is an extension to the MediaWiki software and cannot be used standalone.');
}

$wgExtensionCredits['other'][] = [
    'path' => __FILE__,
    'name' => 'CignoApp',
    'author' => 'Roberto Mauro',
    'description' => 'CignoApp MediaWiki Extension',
    'version' => '1.0.0',
];