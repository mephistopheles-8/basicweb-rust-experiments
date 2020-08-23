{ pkgs ? import <nixpkgs> {} }:
with pkgs;
let
  app-restaurant = callPackage ./default.nix {};
in pkgs.dockerTools.buildImage {
  name = "basicweb-app-restaurant";
  tag = "latest";
  created = "now";
  contents = [ app-restaurant ];
  config = {
    Cmd = [ "/bin/app-restaurant" ];
    WorkingDir = "/";
    Env = [
      "DATABASE_URL=/data/database.sqlite"
      "STATIC_DIR=/static"
    ];
  };
}
