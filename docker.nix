{ pkgs ? import <nixpkgs> {} }:
with pkgs;
let
  app-gallery = callPackage ./default.nix {};
  nonRootShadowSetup = { user, uid, gid ? uid }: with pkgs; [
  (
  writeTextDir "etc/shadow" ''
    root:!x:::::::
    ${user}:!:::::::
  ''
  )
  (
  writeTextDir "etc/passwd" ''
    root:x:0:0::/root:${runtimeShell}
    ${user}:x:${toString uid}:${toString gid}::/home/${user}:
  ''
  )
  (
  writeTextDir "etc/group" ''
    root:x:0:
    ${user}:x:${toString gid}:
  ''
  )
  (
  writeTextDir "etc/gshadow" ''
    root:x::
    ${user}:x::
  ''
  )
];
in pkgs.dockerTools.buildImage {
  name = "basicweb-app-gallery";
  tag = "latest";
  created = "now";
  contents = [ app-gallery (nonRootShadowSetup {uid = 999; user="webapp";}) ];
  runAsRoot = ''
      #!${pkgs.stdenv.shell}
      mkdir -m 1777 /tmp
      mkdir -p /tmp/basicweb-app-gallery
      chown -R webapp:webapp /tmp/basicweb-app-gallery
      chmod -R 770 /tmp/basicweb-app-gallery

      chown -R webapp:webapp /data
      chmod -R 775 /data
      chmod 660 /data/database.sqlite 
  '';
  config = {
    User = "webapp:webapp";
    Cmd  = [ "/bin/app-gallery" ];
    WorkingDir = "/";
    Env = [
      "DATABASE_URL=/data/database.sqlite"
      "STATIC_DIR=/static"
      "TMP_DIR=/tmp/basicweb-app-gallery"
      "DATA_DIR=/data"
      "USER_ASSET_DIR=/data/assets"
    ];
    Volumes = {
      "/data" = {};
    };
  };
}
