from setuptools import setup, find_packages

print (find_packages)

setup(
    name='extensions',
    version='1.0.0',
    # list the python packages required here, e.g ['arrow','pyyaml']. Probably the same packages as in requirements.txt
    install_requires=[],
    packages=find_packages(exclude=["tests"])
)