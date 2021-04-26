{ pkgs ? import <nixpkgs> {} }:
with pkgs;
let
  app = callPackage ./default.nix {};
in pkgs.dockerTools.buildImage {
  name = "basicweb-app";
  tag = "latest";
  created = "now";
  contents = [ app ];
  config = {
    Cmd = [ "/bin/app" ];
    WorkingDir = "/";
    Env = [
      "DATABASE_URL=/data/database.sqlite"
      "STATIC_DIR=/static"
    ];
  };
}
