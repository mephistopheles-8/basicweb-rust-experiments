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
    ];
  };
}
