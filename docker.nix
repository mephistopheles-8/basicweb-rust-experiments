{ pkgs ? import <nixpkgs> {} }:
with pkgs;
let
  app-gallery = callPackage ./default.nix {};
in pkgs.dockerTools.buildImage {
  name = "basicweb-app-gallery";
  tag = "latest";
  created = "now";
  contents = [ app-gallery ];
  config = {
    Cmd = [ "/bin/app-gallery" ];
    WorkingDir = "/";
    Env = [
      "DATABASE_URL=/data/database.sqlite"
      "STATIC_DIR=/static"
    ];
  };
}
