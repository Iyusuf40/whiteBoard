#!/bin/python3

""" sets up a web server """

from fabric.api import *

env.hosts = ["flexrecords.cloza.tech"]

def transfer_file(file_):
    """transfers files to server """
    for f in file_.split(','):
        put(f)

    print("======= done transfering ======")


def run_script(file_):
    """ runs a script remotely """
    transfer_file(file_)
    for f in file_.split(','):
        run("chmod u+x " + f)
        run("./" + f)
